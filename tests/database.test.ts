import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { beforeAll, afterAll, beforeEach, test, expect } from "vitest";
let db: PGlite;
const a = "30000000-0000-4000-8000-000000000001",
  b = "30000000-0000-4000-8000-000000000002",
  c = "30000000-0000-4000-8000-000000000003";
const culprit = "20000000-0000-4000-8000-000000000001";
async function as(uid: string, anon = false) {
  await db.exec(
    `reset role;select set_config('request.jwt.claim.sub','${uid}',false);select set_config('request.jwt.claims','{"is_anonymous":${anon}}',false);set role authenticated;`,
  );
}
async function action(value: Record<string, unknown>) {
  const r = await db.query<{ v: { code: string } }>(
    "select public.mm_action($1::jsonb) v",
    [JSON.stringify(value)],
  );
  const result = r.rows[0].v as { code: string; error?: string };
  if (result.error) throw new Error(result.error);
  return result;
}
async function snap(code: string) {
  return (
    await db.query<{ v: import("../src/lib/types").RoomSnapshot }>(
      "select public.mm_snapshot($1) v",
      [code],
    )
  ).rows[0].v;
}
async function owner(sql: string) {
  await db.exec("reset role");
  await db.exec(sql);
  await as(a);
}
async function room(caseSlug = "ultima-luz") {
  await as(a);
  const { code } = await action({
    action: "create",
    minutes: 1,
    voteMinutes: 1,
    allowGuests: false,
    caseSlug,
  });
  await as(b);
  await action({ action: "join", code });
  await action({ action: "ready", code, ready: true });
  await as(a);
  await action({ action: "ready", code, ready: true });
  await action({ action: "start", code });
  return code;
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;grant usage on schema auth to authenticated,anon;grant execute on all functions in schema auth to authenticated,anon;insert into auth.users values('${a}'),('${b}'),('${c}');`,
  );
  for (const f of readdirSync("supabase/migrations").sort())
    await db.exec(readFileSync("supabase/migrations/" + f, "utf8"));
  for (const uid of [a, b, c]) {
    await as(uid);
    await action({
      action: "profile",
      name: "Agente " + uid.slice(-1),
      avatar: "lupa",
    });
  }
}, 30000);
beforeEach(async () => {
  await db.exec(
    "reset role;truncate public.mm_rooms cascade;truncate mm_private.join_limits;",
  );
  await as(a);
});
test("only the server role can claim registration slots, with limits and expiry stored in PostgreSQL", async () => {
  await expect(
    db.query("select public.mm_claim_registration('test', 2)"),
  ).rejects.toThrow(/permission denied/);
  await db.exec("reset role;set role service_role");
  const claim = async () =>
    (
      await db.query<{ allowed: boolean }>(
        "select public.mm_claim_registration('test', 2) as allowed",
      )
    ).rows[0].allowed;
  expect(await claim()).toBe(true);
  expect(await claim()).toBe(true);
  expect(await claim()).toBe(false);
  await db.exec(
    "update mm_private.registration_limits set window_start = now() - interval '2 hours' where bucket = 'test'",
  );
  expect(await claim()).toBe(true);
  await db.exec("reset role;set role anon");
  await expect(
    db.query("select public.mm_claim_registration('test', 2)"),
  ).rejects.toThrow(/permission denied/);
  await expect(
    db.query("select * from mm_private.registration_limits"),
  ).rejects.toThrow(/permission denied/);
});
test("catalog selects the train without changing the museum or exposing either solution", async () => {
  const home = (
    await db.query<{ v: import("../src/lib/types").HomeSnapshot }>(
      "select public.mm_home() v",
    )
  ).rows[0].v;
  expect(home.cases.map((c) => c.slug)).toEqual(
    expect.arrayContaining(["ultima-luz", "expreso-medianoche"]),
  );
  expect(
    home.cases.find((c) => c.slug === "expreso-medianoche")?.suspect_count,
  ).toBe(5);
  expect(JSON.stringify(home.cases)).not.toContain("suspect_id");
  await expect(
    action({
      action: "create",
      caseSlug: "missing-case",
      minutes: 1,
      voteMinutes: 1,
      allowGuests: false,
    }),
  ).rejects.toThrow("no está disponible");
  const code = await room("expreso-medianoche");
  const data = await snap(code);
  expect(data.case.theme).toBe("train");
  expect(data.suspects).toHaveLength(5);
  expect(data.case.locations).toHaveLength(5);
  expect(data.solution).toBeNull();
  expect(data.evidence.every((e) => e.stage === 0 && e.location_id)).toBe(true);
  expect(data.evidence).toHaveLength(5);
  const museum = await snap(await room());
  expect(museum.case.title).toBe("La última luz del museo");
  expect(museum.suspects).toHaveLength(4);
});
test("sharing a private clue requires explicit consent and copies only canonical content", async () => {
  const code = await room("expreso-medianoche");
  const data = await snap(code);
  const evidence = data.evidence.find((e) => e.user_id === a)!;
  await expect(
    action({
      action: "timeline_pin",
      code,
      evidence: evidence.id,
      minute: 1420,
    }),
  ).rejects.toThrow("Confirma");
  await action({
    action: "timeline_pin",
    code,
    evidence: evidence.id,
    minute: 1420,
    sharePrivate: true,
    title: "FORGED",
    body: "FORGED",
  });
  await action({
    action: "timeline_pin",
    code,
    evidence: evidence.id,
    minute: 1417,
    sharePrivate: true,
  });
  await as(b);
  const other = await snap(code);
  expect(other.evidence.some((e) => e.id === evidence.id)).toBe(false);
  expect(other.timeline).toHaveLength(1);
  expect(other.timeline[0]).toMatchObject({
    title: evidence.title,
    body: evidence.body,
    minute: 1417,
    shared_private: true,
    user_id: a,
  });
  expect(
    (await db.query("select * from public.mm_timeline")).rows,
  ).toHaveLength(1);
  await expect(
    action({
      action: "timeline_pin",
      code,
      evidence: evidence.id,
      minute: 1418,
      sharePrivate: true,
    }),
  ).rejects.toThrow("No puedes compartir");
  await expect(
    action({ action: "timeline_remove", code, entry: other.timeline[0].id }),
  ).rejects.toThrow("Solo puedes");
  await as(c);
  expect(
    (await db.query("select * from public.mm_timeline")).rows,
  ).toHaveLength(0);
  await expect(
    action({ action: "timeline_remove", code, entry: other.timeline[0].id }),
  ).rejects.toThrow("No perteneces");
  await expect(
    db.query("select mm_private.timeline_action('{}'::jsonb)"),
  ).rejects.toThrow("permission denied");
  await as(a);
  await action({
    action: "timeline_remove",
    code,
    entry: other.timeline[0].id,
  });
  expect((await snap(code)).timeline).toHaveLength(0);
});
test("timeline denies future, cross-room and direct writes and locks once voting opens", async () => {
  const code = await room("expreso-medianoche");
  const first = await snap(code);
  const publicClue = first.evidence.find((e) => !e.user_id)!;
  await owner(`select 1`);
  await db.exec("reset role");
  const future = (
    await db.query<{ id: string }>(
      "select id from public.mm_evidence where stage=1 limit 1",
    )
  ).rows[0].id;
  await as(a);
  await expect(
    action({
      action: "timeline_pin",
      code,
      evidence: future,
      minute: 1417,
      sharePrivate: true,
    }),
  ).rejects.toThrow("No puedes compartir");
  await expect(
    action({
      action: "timeline_pin",
      code,
      evidence: publicClue.id,
      minute: 1440,
    }),
  ).rejects.toThrow("hora válida");
  await action({
    action: "timeline_pin",
    code,
    evidence: publicClue.id,
    minute: 1417,
  });
  await as(b);
  await expect(
    action({
      action: "timeline_pin",
      code,
      evidence: publicClue.id,
      minute: 1418,
    }),
  ).rejects.toThrow("Solo quien");
  await expect(
    db.query("update public.mm_timeline set minute=0"),
  ).rejects.toThrow("permission denied");
  const otherCode = await room();
  await expect(
    action({
      action: "timeline_pin",
      code: otherCode,
      evidence: publicClue.id,
      minute: 1417,
    }),
  ).rejects.toThrow("No puedes compartir");
  await owner(
    `update public.mm_games set stage=2,phase_ends_at=now()+interval '1 minute' where room_id=(select id from public.mm_rooms where code='${code}')`,
  );
  await expect(
    action({
      action: "timeline_remove",
      code,
      entry: (await snap(code)).timeline[0].id,
    }),
  ).rejects.toThrow("solo se edita");
  await expect(
    action({
      action: "timeline_pin",
      code,
      evidence: publicClue.id,
      minute: 1418,
    }),
  ).rejects.toThrow("solo se edita");
  expect((await snap(code)).timeline[0].minute).toBe(1417);
});
test("the train unlocks its second phase, keeps fourteen distinct clues and settles its own answer", async () => {
  const code = await room("expreso-medianoche");
  await owner(
    `update public.mm_games set phase_ends_at=now()-interval '1 second' where room_id=(select id from public.mm_rooms where code='${code}')`,
  );
  await action({ action: "tick", code });
  const first = await snap(code);
  expect(first.game?.stage).toBe(1);
  expect(first.evidence).toHaveLength(10);
  expect(
    first.evidence.every((e) =>
      first.case.locations.some(
        (l) => l.id === e.location_id && l.stage <= e.stage,
      ),
    ),
  ).toBe(true);
  const own = first.evidence.filter((e) => e.user_id === a).map((e) => e.id);
  await as(b);
  const second = await snap(code);
  expect(second.evidence).toHaveLength(10);
  expect(second.evidence.some((e) => own.includes(e.id))).toBe(false);
  expect(
    new Set([...first.evidence, ...second.evidence].map((e) => e.id)).size,
  ).toBe(14);
  const responsible = first.suspects.find((s) => s.name === "Elena Cruz")!.id;
  await owner(
    `update public.mm_games set stage=2,phase_ends_at=now()+interval '1 minute' where room_id=(select id from public.mm_rooms where code='${code}')`,
  );
  await expect(
    action({ action: "vote", code, suspect: culprit }),
  ).rejects.toThrow("Sospechoso inválido");
  await action({ action: "vote", code, suspect: responsible });
  await as(b);
  await action({ action: "vote", code, suspect: responsible });
  const final = await snap(code);
  expect(final.game?.success).toBe(true);
  expect(final.solution?.suspect_id).toBe(responsible);
  expect(final.results.map((r) => r.points)).toEqual([150, 150]);
});
afterAll(async () => {
  await db.close();
});
test("RLS hides rooms, messages and private schema from outsiders", async () => {
  const code = await room();
  await as(c);
  expect((await db.query("select * from public.mm_rooms")).rows).toHaveLength(
    0,
  );
  await expect(snap(code)).rejects.toThrow("No perteneces");
  await expect(action({ action: "start", code })).rejects.toThrow(
    "No perteneces",
  );
  await expect(db.query("select * from mm_private.solutions")).rejects.toThrow(
    "permission denied",
  );
  await expect(
    db.query("select mm_private.finish(gen_random_uuid())"),
  ).rejects.toThrow("permission denied");
});
test("anonymous visitors cannot execute RPCs; guests obey room configuration", async () => {
  await db.exec("reset role;set role anon");
  await expect(db.query("select public.mm_home()")).rejects.toThrow(
    "permission denied",
  );
  await as(a);
  const { code } = await action({
    action: "create",
    minutes: 1,
    voteMinutes: 1,
    allowGuests: false,
  });
  await as(c, true);
  await expect(action({ action: "join", code })).rejects.toThrow(
    "requiere una cuenta",
  );
});
test("start requires host, two connected players and ready checks; join is idempotent", async () => {
  await as(a);
  const { code } = await action({
    action: "create",
    minutes: 1,
    voteMinutes: 1,
    allowGuests: false,
  });
  await expect(action({ action: "start", code })).rejects.toThrow(
    "dos jugadores",
  );
  await as(b);
  await action({ action: "join", code });
  await action({ action: "join", code });
  await expect(action({ action: "start", code })).rejects.toThrow(
    "Solo el anfitrión",
  );
  await as(a);
  expect((await snap(code)).participants).toHaveLength(2);
  await expect(action({ action: "start", code })).rejects.toThrow(
    "Todos deben",
  );
});
test("private clues and future clues are inaccessible; solution withheld until finish", async () => {
  const code = await room();
  const first = await snap(code);
  expect(first.solution).toBeNull();
  expect(first.evidence.every((e) => e.stage === 0)).toBe(true);
  expect(first.evidence.filter((e) => e.user_id)).toHaveLength(2);
  const ownIds = first.evidence.filter((e) => e.user_id).map((e) => e.id);
  await as(b);
  const second = await snap(code);
  expect(second.evidence.some((e) => ownIds.includes(e.id))).toBe(false);
  const raw = await db.query<{ user_id: string | null; stage: number }>(
    "select * from public.mm_evidence",
  );
  expect(raw.rows.every((e) => e.user_id === null || e.user_id === b)).toBe(
    true,
  );
  expect(raw.rows.every((e) => e.stage === 0)).toBe(true);
  await expect(db.query("update public.mm_games set stage=3")).rejects.toThrow(
    "permission denied",
  );
});
test("votes are immutable, membership checked, correct points settled exactly once", async () => {
  const code = await room();
  await expect(
    action({ action: "vote", code, suspect: culprit }),
  ).rejects.toThrow("no está abierta");
  await owner(
    `update public.mm_games set stage=2,phase_ends_at=now()+interval '1 minute' where room_id=(select id from public.mm_rooms where code='${code}')`,
  );
  await action({ action: "vote", code, suspect: culprit });
  await expect(
    action({ action: "vote", code, suspect: culprit }),
  ).rejects.toThrow("ya está registrado");
  await expect(
    db.query(
      "insert into public.mm_votes(game_id,room_id,user_id,suspect_id) select g.id,g.room_id,$1,$2 from public.mm_games g",
      [b, culprit],
    ),
  ).rejects.toThrow("permission denied");
  await as(b);
  await action({ action: "vote", code, suspect: culprit });
  let final = await snap(code);
  expect(final.game?.stage).toBe(3);
  expect(final.game?.success).toBe(true);
  expect(final.solution?.suspect_id).toBe(culprit);
  expect(final.results.map((r) => r.points)).toEqual([150, 150]);
  await action({ action: "tick", code });
  final = await snap(code);
  expect(final.results).toHaveLength(2);
});
test("timer catches up from an idle game; late votes rejected and tied votes lose", async () => {
  const code = await room();
  await owner(
    `update public.mm_games set phase_ends_at=now()-interval '4 minutes' where room_id=(select id from public.mm_rooms where code='${code}')`,
  );
  await action({ action: "tick", code });
  expect((await snap(code)).game?.stage).toBe(3);
  await expect(
    action({ action: "vote", code, suspect: culprit }),
  ).rejects.toThrow("no está abierta");
  const code2 = await room();
  await owner(
    `update public.mm_games set stage=2,phase_ends_at=now()+interval '1 minute' where room_id=(select id from public.mm_rooms where code='${code2}')`,
  );
  await action({ action: "vote", code: code2, suspect: culprit });
  await as(b);
  await action({
    action: "vote",
    code: code2,
    suspect: "20000000-0000-4000-8000-000000000002",
  });
  const final = await snap(code2);
  expect(final.game?.success).toBe(false);
  expect(final.game?.team_suspect).toBeNull();
  expect(final.results.map((r) => r.points)).toEqual([100, 0]);
});
test("chat text, rate limit and reconnect do not duplicate participants or state", async () => {
  const code = await room();
  await action({ action: "chat", code, text: "Revisemos el horario." });
  await expect(
    action({ action: "chat", code, text: "Otra teoría" }),
  ).rejects.toThrow("Espera un segundo");
  await expect(
    action({ action: "chat", code, text: " ".repeat(5) }),
  ).rejects.toThrow("1 y 500");
  await action({ action: "join", code });
  const data = await snap(code);
  expect(data.participants).toHaveLength(2);
  expect(data.messages).toHaveLength(1);
  await as(c);
  await expect(action({ action: "join", code })).rejects.toThrow("ya comenzó");
});
test("invite attempts persist on failures and internal action cannot bypass the limiter", async () => {
  await as(c);
  for (let i = 0; i < 20; i++)
    await expect(action({ action: "join", code: "FFFFFFFF" })).rejects.toThrow(
      "No se encontró",
    );
  await expect(action({ action: "join", code: "FFFFFFFF" })).rejects.toThrow(
    "Demasiados intentos",
  );
  await expect(
    db.query('select mm_private.action(\'{"action":"tick"}\')'),
  ).rejects.toThrow("permission denied");
});
test("host takeover requires an absent host; the original identity can reconnect", async () => {
  const code = await room();
  await as(b);
  await expect(action({ action: "claim", code })).rejects.toThrow(
    "sigue conectado",
  );
  await owner(
    `update public.mm_participants set last_seen=now()-interval '1 minute' where user_id='${a}'`,
  );
  await as(b);
  await action({ action: "claim", code });
  expect((await snap(code)).room.host_id).toBe(b);
  await as(a);
  await action({ action: "join", code });
  expect((await snap(code)).participants).toHaveLength(2);
});
test("room capacity, votes for another case and arbitrary score changes are rejected", async () => {
  const code = await room();
  await owner(
    `insert into public.mm_cases(id,slug,title,intro,stages) values('10000000-0000-4000-8000-000000000002','otro','Otro','Otro','[]');insert into public.mm_suspects(id,case_id,name,description,motive,alibi) values('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','Otro','Otro','Otro','Otro'); update public.mm_games set stage=2,phase_ends_at=now()+interval '1 minute' where room_id=(select id from public.mm_rooms where code='${code}');`,
  );
  await expect(
    action({
      action: "vote",
      code,
      suspect: "20000000-0000-4000-8000-000000000005",
    }),
  ).rejects.toThrow("Sospechoso inválido");
  await expect(
    db.query("update public.mm_results set points=150"),
  ).rejects.toThrow("permission denied");
  await as(a);
  const lobby = await action({
    action: "create",
    minutes: 1,
    voteMinutes: 1,
    allowGuests: false,
  });
  await owner(
    `insert into auth.users select ('40000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,7) n;insert into public.mm_profiles select id,'Test','lupa' from auth.users where id::text like '40000000%';insert into public.mm_participants(room_id,user_id) select r.id,p.id from public.mm_rooms r cross join public.mm_profiles p where r.code='${lobby.code}' and p.id::text like '40000000%';`,
  );
  await as(c);
  await expect(action({ action: "join", code: lobby.code })).rejects.toThrow(
    "llena",
  );
});
