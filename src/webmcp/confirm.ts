export type ConfirmationDecision =
  | { kind: "resolved"; confirmed: boolean }
  | { kind: "manual" };

export function isUnsupportedUserInteraction(error: unknown): boolean {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /not supported|unsupported|is not a function|WebMCP shim/i.test(text);
}

function interactionCallback(options: unknown): ((cb: () => Promise<unknown>) => Promise<unknown>) | undefined {
  if (!options || typeof options !== "object") return undefined;
  const value = (options as { requestUserInteraction?: unknown }).requestUserInteraction;
  return typeof value === "function"
    ? (value as (cb: () => Promise<unknown>) => Promise<unknown>)
    : undefined;
}

export async function requestTerminationConfirmation(
  options: unknown,
  message: string,
): Promise<ConfirmationDecision> {
  const requestUserInteraction = interactionCallback(options);
  if (typeof requestUserInteraction === "function") {
    try {
      const confirmed = await requestUserInteraction(async () => window.confirm(message));
      return { kind: "resolved", confirmed: Boolean(confirmed) };
    } catch (error) {
      if (!isUnsupportedUserInteraction(error)) throw error;
    }
  }
  return { kind: "manual" };
}
