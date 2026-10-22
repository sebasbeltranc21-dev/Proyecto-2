import type { Action } from "./validation";
export async function act(action: Action): Promise<{ code?: string }> {
  const response = await fetch("/api/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  const value = await response.json();
  if (!response.ok)
    throw new Error(value.error || "No se pudo completar la acción.");
  return value;
}
