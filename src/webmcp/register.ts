import { subscribe } from "../state/store";
import { detectWebMcp } from "./detect";
import { buildTools } from "./tools";

let abort: AbortController | null = null;
let generation = 0;
let started = false;

export async function syncWebMcpTools(): Promise<void> {
  const detected = detectWebMcp();
  if (!detected.context) return;
  const mine = ++generation;
  abort?.abort();
  const controller = new AbortController();
  abort = controller;
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
