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
