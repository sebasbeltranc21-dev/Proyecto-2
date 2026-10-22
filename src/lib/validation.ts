import { z } from "zod";
export const roomCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-F0-9]{8}$/, "Usa el código de 8 caracteres.");
export const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("profile"),
    name: z.string().trim().min(2).max(24),
    avatar: z.enum(["lupa", "huella", "llave", "luna"]),
  }),
  z.object({
    action: z.literal("create"),
    allowGuests: z.boolean(),
    minutes: z.number().int().min(1).max(15),
    voteMinutes: z.number().int().min(1).max(5),
  }),
  z.object({ action: z.literal("join"), code: roomCode }),
  z.object({ action: z.literal("ready"), code: roomCode, ready: z.boolean() }),
  z.object({ action: z.literal("start"), code: roomCode }),
  z.object({ action: z.literal("tick"), code: roomCode }),
  z.object({ action: z.literal("claim"), code: roomCode }),
  z.object({
    action: z.literal("chat"),
    code: roomCode,
    text: z.string().trim().min(1).max(500),
  }),
  z.object({
    action: z.literal("vote"),
    code: roomCode,
    suspect: z.string().uuid(),
  }),
]);
export type Action = z.infer<typeof actionSchema>;
