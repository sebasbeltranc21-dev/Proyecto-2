import { test, expect } from "vitest";
import { actionSchema, roomCode } from "../src/lib/validation";
test("normalizes room codes and rejects oversized or invalid actions", () => {
  expect(roomCode.parse(" a1b2c3d4 ")).toBe("A1B2C3D4");
  expect(
    actionSchema.safeParse({
      action: "create",
      minutes: 0,
      voteMinutes: 2,
      allowGuests: false,
    }).success,
  ).toBe(false);
  expect(
    actionSchema.safeParse({
      action: "chat",
      code: "A1B2C3D4",
      text: "x".repeat(501),
    }).success,
  ).toBe(false);
  expect(
    actionSchema.safeParse({
      action: "vote",
      code: "A1B2C3D4",
      suspect: "Clara",
    }).success,
  ).toBe(false);
  expect(
    actionSchema.safeParse({ action: "set_points", points: 10000 }).success,
  ).toBe(false);
});
import { sameOrigin } from "../src/lib/origin";
test("timeline accepts bounded minutes and rejects forged identifiers and consent types", () => {
  const pin = {
    action: "timeline_pin",
    code: "A1B2C3D4",
    evidence: "50000000-0000-4000-8000-000000000001",
    minute: 1417,
    sharePrivate: true,
  };
  expect(actionSchema.safeParse(pin).success).toBe(true);
  for (const minute of [-1, 1440, 1.5])
    expect(actionSchema.safeParse({ ...pin, minute }).success).toBe(false);
  expect(actionSchema.safeParse({ ...pin, sharePrivate: "true" }).success).toBe(
    false,
  );
  expect(actionSchema.safeParse({ ...pin, evidence: "unknown" }).success).toBe(
    false,
  );
});
test("same-origin validation supports local and hosted requests and rejects forged origins", () => {
  expect(sameOrigin("http://127.0.0.1:3000", "127.0.0.1:3000")).toBe(true);
  expect(sameOrigin("https://modo.example", "modo.example")).toBe(true);
  expect(sameOrigin("https://evil.example", "modo.example")).toBe(false);
  expect(sameOrigin("https://modo.example.evil.example", "modo.example")).toBe(
    false,
  );
  expect(sameOrigin("null", "modo.example")).toBe(false);
  expect(sameOrigin("https://modo.example/path", "modo.example")).toBe(false);
});
