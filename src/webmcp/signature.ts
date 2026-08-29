import type { WebMcpTool } from "./tools.ts";

export function registrationSignature(tools: WebMcpTool[]): string {
  return JSON.stringify(
    tools.map(({ name, title, description, inputSchema, annotations }) => ({
      name,
      title,
      description,
      inputSchema,
      annotations,
    })),
  );
}
