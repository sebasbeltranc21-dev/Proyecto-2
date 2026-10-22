import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { beforeAll, afterAll, test, expect } from "vitest";
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
  return r.rows[0].v;
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
async function room() {
  await as(a);
  const { code } = await action({
    action: "create",
    minutes: 1,
    voteMinutes: 1,
    allowGuests: false,
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
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;grant usage on schema auth to authenticated,anon;grant execute on all functions in schema auth to authenticated,anon;insert into auth.users values('${a}'),('${b}'),('${c}');`,
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
