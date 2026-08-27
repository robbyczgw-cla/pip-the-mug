import { subscribe } from "../state/store";
import { detectWebMcp } from "./detect";
import { buildTools } from "./tools";

/**
 * Tools register on the page with the WebMCP API:
 *
 * document.modelContext.registerTool({
 *   name: "list_staff",
 *   description: "List current Desk 4B staff",
 *   inputSchema: { type: "object", properties: {}, additionalProperties: false },
 *   execute: async (input) => { return { ok: true }; },
 * });
 *
 * navigator.modelContext.registerTool is the fallback. Live names:
 * list_staff, get_personnel_file, get_org_chart, write_review, put_on_pip,
 * resolve_pip, promote, relocate, terminate.
 */

let abort: AbortController | null = null;
let generation = 0;
let started = false;
let lastSignature = "";

function signature(): string {
  return buildTools()
    .map((tool) => tool.name)
    .join("|");
}

export async function syncWebMcpTools(force = false): Promise<void> {
  const detected = detectWebMcp();
  if (!detected.context) return;
  const sig = signature();
  if (!force && sig === lastSignature && abort) return;
  const mine = ++generation;
  abort?.abort();
  const controller = new AbortController();
  abort = controller;
  lastSignature = sig;
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  if (mine !== generation) return;
  const tools = buildTools();
  for (const tool of tools) {
    if (mine !== generation || controller.signal.aborted) return;
    try {
      await detected.context.registerTool(
        {
          name: tool.name,
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: tool.annotations,
          execute: (input, extra) => tool.execute(input ?? {}, extra),
        },
        { signal: controller.signal },
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      console.warn("WebMCP registerTool failed", tool.name, error);
    }
  }
}

export function startWebMcp(): void {
  if (started) return;
  started = true;
  subscribe(() => {
    void syncWebMcpTools();
  });
  void syncWebMcpTools();
}
