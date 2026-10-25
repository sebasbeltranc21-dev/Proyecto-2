import { existsSync, writeFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
if (existsSync(".env.local")) loadEnvFile(".env.local");
if (process.env.VERIFY_FICTIONAL_ACCOUNTS !== "true")
  throw new Error(
    "Set VERIFY_FICTIONAL_ACCOUNTS=true to create two temporary fictional accounts and a game.",
  );
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert(url && key, "Missing public Supabase configuration");
const suffix = Date.now();
const password = randomBytes(24).toString("base64url") + "!";
const emails = [`qa.${suffix}.one@example.com`, `qa.${suffix}.two@example.com`];
const clients = [];
const ids = [];
let code;
let channel;
const checkpoint = () =>
  writeFileSync(
    "/tmp/mm-fictional-verification.json",
    JSON.stringify({ ids, code, emails }),
  );
const client = () =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
async function rpc(c, name, args) {
  const { data, error } = await c.rpc(name, args);
  assert(!error, error?.message);
  assert(!data?.error, data?.error);
  return data;
}
async function act(c, payload) {
  return rpc(c, "mm_action", { payload });
}
async function login(c, email) {
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  assert(!error, error?.message);
  assert(data.session);
  return data.user.id;
}
try {
  for (const email of emails) {
    const response = await fetch(`${url}/functions/v1/register-fictional`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        origin: "https://proyecto-2-rho.vercel.app",
      },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(response.status, 201, await response.text());
    const c = client();
    clients.push(c);
    ids.push(await login(c, email));
    checkpoint();
  }
  assert.notEqual(ids[0], ids[1]);
  const duplicate = await fetch(`${url}/functions/v1/register-fictional`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emails[0],
      password: "Different-practice-password-492!",
    }),
  });
  assert.equal(duplicate.status, 400);
  for (const [i, c] of clients.entries())
    await act(c, {
      action: "profile",
      name: `Agente Prueba ${i + 1}`,
      avatar: "lupa",
    });
  await clients[0].auth.signOut();
  assert.equal(await login(clients[0], emails[0]), ids[0]);
  const recovered = await rpc(clients[0], "mm_home");
  assert.equal(recovered.profile.name, "Agente Prueba 1");
  console.log(
    "Created two confirmed fictional accounts; duplicate rejected; original password and saved profile recovered.",
  );
  ({ code } = await act(clients[0], {
    action: "create",
    caseSlug: "ultima-luz",
    minutes: 1,
    voteMinutes: 1,
    allowGuests: false,
  }));
  checkpoint();
  await act(clients[1], { action: "join", code });
  for (const c of clients) await act(c, { action: "ready", code, ready: true });
  await act(clients[0], { action: "start", code });
  let snap = await rpc(clients[1], "mm_snapshot", { code });
  const message = `Teoría ficticia ${suffix}: revisemos el registro del museo.`;
  let received;
  const realtime = new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Realtime message timed out")),
      20000,
    );
    received = () => {
      clearTimeout(timer);
      resolve();
    };
  });
  await new Promise((resolve, reject) => {
    channel = clients[1]
      .channel(`registration-check:${suffix}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mm_messages",
          filter: `room_id=eq.${snap.room.id}`,
        },
        (payload) => {
          if (payload.new.body === message) received();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") resolve();
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          reject(new Error(status));
      });
  });
  await act(clients[0], { action: "chat", code, text: message });
  await realtime;
  snap = await rpc(clients[1], "mm_snapshot", { code });
  assert(snap.messages.some((m) => m.body === message));
  console.log(
    "Realtime chat delivered to the second authenticated account and persisted in its snapshot. Waiting for the normal game phases.",
  );
  const deadline = Date.now() + 145000;
  while (snap.game.stage < 2 && Date.now() < deadline) {
    await delay(3000);
    for (const c of clients) await act(c, { action: "tick", code });
    snap = await rpc(clients[1], "mm_snapshot", { code });
  }
  assert.equal(
    snap.game.stage,
    2,
    "Expected voting after both one-minute phases",
  );
  const suspect = snap.suspects.find((s) => s.name === "Clara Vidal");
  assert(suspect);
  for (const c of clients)
    await act(c, { action: "vote", code, suspect: suspect.id });
  snap = await rpc(clients[0], "mm_snapshot", { code });
  assert.equal(snap.results.length, 2);
  assert(
    snap.results.every((result) => result.correct && result.points === 150),
  );
  await clients[0].auth.signOut();
  const fresh = client();
  clients.push(fresh);
  assert.equal(await login(fresh, emails[0]), ids[0]);
  const home = await rpc(fresh, "mm_home");
  assert.equal(home.profile.name, "Agente Prueba 1");
  assert.equal(home.stats.games, 1);
  assert.equal(home.stats.points, 150);
  assert(
    home.history.some((item) => item.code === code && item.points === 150),
  );
  console.log(
    "PASS: a fresh Auth session recovered the saved profile, finished game and 150 points.",
  );
} finally {
  if (channel && clients[1]) await clients[1].removeChannel(channel);
  for (const c of clients) {
    await c.auth.signOut();
    c.realtime.disconnect();
  }
  checkpoint();
  console.log(
    "Signed out test sessions; exact fixture IDs are in /tmp/mm-fictional-verification.json for scoped cleanup.",
  );
}
