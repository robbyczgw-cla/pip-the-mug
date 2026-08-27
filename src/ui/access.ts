import { buildTools } from "../webmcp/tools";
import { detectWebMcp } from "../webmcp/detect";

export function renderAccess(): string {
  const detected = detectWebMcp();
  const tools = buildTools();
  const names = tools.map((tool) => tool.name);
  const notes: string[] = [];
  if (!names.includes("resolve_pip")) notes.push("resolve_pip off");
  if (!names.includes("terminate")) notes.push("terminate off");
  const source = detected.source ?? "manual only";
  return `
    <p class="access-strip" aria-label="HR systems access">
      ${names.length} tools · ${source} · ${names.join(" · ")}${notes.length ? ` · ${notes.join(" · ")}` : ""}
    </p>
  `;
}
