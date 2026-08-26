export interface ModelContextLike {
  registerTool: (
    tool: {
      name: string;
      title?: string;
      description: string;
      inputSchema?: unknown;
      annotations?: Record<string, unknown>;
      execute: (input: Record<string, unknown>, extra?: unknown) => unknown;
    },
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
  getTools?: () => Promise<unknown>;
}

export function detectWebMcp(): { available: boolean; source: "document.modelContext" | "navigator.modelContext" | null; context: ModelContextLike | null } {
  const doc = document as Document & { modelContext?: ModelContextLike };
  const nav = navigator as Navigator & { modelContext?: ModelContextLike };
  if (doc.modelContext && typeof doc.modelContext.registerTool === "function") {
    return { available: true, source: "document.modelContext", context: doc.modelContext };
  }
  if (nav.modelContext && typeof nav.modelContext.registerTool === "function") {
    return { available: true, source: "navigator.modelContext", context: nav.modelContext };
  }
  return { available: false, source: null, context: null };
}
