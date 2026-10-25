import { test, expect, type Page } from "@playwright/test";
const email1 = process.env.E2E_HOST_EMAIL,
  email2 = process.env.E2E_PLAYER_EMAIL,
  password = process.env.E2E_PASSWORD;
async function login(page: Page, email: string, name: string) {
  await page.goto("/acceso");
  await page.getByLabel("Correo electrónico de práctica").fill(email);
  await page.getByLabel("Contraseña").fill(password!);
  await page.getByRole("button", { name: "Entrar al expediente" }).click();
  await expect(page).toHaveURL(/\/panel$/);
  await page.getByLabel("Nombre visible").fill(name);
  await page.getByRole("button", { name: "Guardar perfil" }).click();
  await expect(page.getByRole("status")).toHaveText("Guardado");
}
for (const scenario of [
  {
    title: "La última luz del museo",
    person: "Clara",
    fullName: "Clara Vidal",
    time: "21:17",
  },
  {
    title: "El Expreso Medianoche",
    person: "Elena",
    fullName: "Elena Cruz",
    time: "23:37",
  },
]) {
  test(`two fictional Auth accounts: ${scenario.title}, private sharing, chat, reconnect, vote and results`, async ({
    browser,
  }) => {
    test.skip(
      !email1 || !email2 || !password,
      "Pending two verified Supabase test accounts and deployment variables.",
    );
    test.setTimeout(210000);
    const ctx1 = await browser.newContext(),
      ctx2 = await browser.newContext();
    const host = await ctx1.newPage(),
      player = await ctx2.newPage();
    try {
      await login(host, email1!, "Agente Uno");
      await login(player, email2!, "Agente Dos");
      await host
        .getByRole("radio", { name: new RegExp(scenario.title) })
        .check();
      await host.getByLabel("Minutos por investigación").selectOption("1");
      await host.getByLabel("Minutos para votar").selectOption("1");
      await host
        .getByRole("button", { name: "Crear sala", exact: true })
        .click();
      await expect(host).toHaveURL(/\/sala\/[A-F0-9]{8}$/);
      const code = host.url().split("/").at(-1)!;
      await player.getByLabel("Código de invitación").fill(code);
      await player.getByRole("button", { name: "Entrar a la sala" }).click();
      await host
        .getByRole("button", { name: "Estoy listo para investigar" })
        .click();
      await player
        .getByRole("button", { name: "Estoy listo para investigar" })
        .click();
      await expect(
        host.getByRole("button", { name: "Iniciar investigación" }),
      ).toBeEnabled();
      await host.getByRole("button", { name: "Iniciar investigación" }).click();
      await expect(player.locator(".evidence-card.private")).toHaveCount(2);
      await expect(host.locator(".evidence-card.private")).toHaveCount(2);
      const privateTitle = await host
        .locator(".evidence-card.private h3")
        .first()
        .textContent();
      await expect(
        player.getByRole("heading", { name: privateTitle!, exact: true }),
      ).toHaveCount(0);
      await host
        .getByRole("button", {
          name: `Examinar evidencia: ${privateTitle}`,
          exact: true,
        })
        .click();
      await host.getByLabel("Hora propuesta").fill(scenario.time);
      await expect(
        host.getByRole("button", { name: "Compartir en la cronología" }),
      ).toBeDisabled();
      await host
        .getByRole("checkbox", {
          name: "Quiero compartir el título y el texto completos de esta pista privada con todo el equipo.",
        })
        .check();
      await host
        .getByRole("button", { name: "Compartir en la cronología" })
        .click();
      await player.getByRole("tab", { name: /Cronología/ }).click();
      await expect(player.locator(".timeline-card")).toContainText(
        privateTitle!,
      );
      await expect(host.locator(".connection")).toHaveText(
        "Tiempo real conectado",
      );
      await expect(player.locator(".connection")).toHaveText(
        "Tiempo real conectado",
      );
      await host.getByRole("tab", { name: /Evidencias/ }).click();
      await host
        .getByLabel("Tu teoría")
        .fill("Contrasta la coartada con el registro.");
      await host.getByRole("button", { name: "Enviar teoría" }).click();
      await expect(player.getByRole("log")).toContainText(
        "Contrasta la coartada",
      );
      await player.reload();
      await expect(player.locator(".team-list li")).toHaveCount(2);
      await expect(player.locator(".evidence-card.private")).toHaveCount(2);
      await expect(
        host.getByRole("button", { name: "Ir a la votación" }),
      ).toBeVisible({ timeout: 135000 });
      for (const page of [host, player]) {
        await page.getByRole("button", { name: "Ir a la votación" }).click();
        await page
          .getByRole("button", { name: `Acusar a ${scenario.person}` })
          .click();
        await page.getByRole("button", { name: "Confirmar voto" }).click();
      }
      for (const page of [host, player]) {
        await expect(
          page.getByRole("button", { name: "Omitir cinemática" }),
        ).toBeVisible({ timeout: 15000 });
        await page.getByRole("button", { name: "Omitir cinemática" }).click();
      }
      await expect(
        host.getByRole("heading", { name: "Caso resuelto." }),
      ).toBeVisible();
      await expect(player.locator(".solution")).toContainText(
        scenario.fullName,
      );
      await expect(host.locator(".result-row")).toHaveCount(2);
      await expect(host.locator(".result-row").first()).toContainText(
        "150 pts",
      );
    } finally {
      await ctx1.close();
      await ctx2.close();
    }
  });
}
