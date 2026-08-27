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
  const chips = names.map((name) => `<span class="tool-chip">${name}</span>`).join("");
  const extra = notes.map((note) => `<span class="tool-chip is-off">${note}</span>`).join("");
  return `
    <p class="access-strip" aria-label="HR systems access">
      <span class="tool-count">${names.length} tools</span>
      <span class="tool-source">${source}</span>
      ${chips}${extra}
    </p>
  `;
}
