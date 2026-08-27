import { clockLabel } from "../lib/id";
import { escapeHtml } from "../lib/dom";
import type { ActivityEntry, Actor } from "../types";

function actorLabel(actor: Actor): string {
  if (actor === "agent") return "Agent";
  if (actor === "system") return "SYSTEM";
  return "Human";
}

export function renderActivityLog(entries: ActivityEntry[], expanded: boolean): string {
  const visible = expanded ? entries : entries.slice(0, 3);
  const rows =
    visible.length === 0
      ? `<li class="muted">No HR actions yet this quarter.</li>`
      : visible
          .map(
            (entry) => `
              <li>
                <span>${escapeHtml(clockLabel(entry.at))}</span>
                <span class="actor-${entry.actor}">${actorLabel(entry.actor)}</span>
                <span><strong>${escapeHtml(entry.tool)}</strong> — ${escapeHtml(entry.summary)}</span>
              </li>
            `,
          )
          .join("");
  const canExpand = entries.length > 3;
  const label = expanded
    ? `HR log ▾ · ${entries.length} · show 3`
    : `HR log · ${Math.min(3, entries.length)} of ${entries.length}`;

  return `
    <section class="log-wrap ${expanded ? "is-expanded" : ""}">
      <button type="button" class="log-toggle" data-action="toggle-log" aria-expanded="${expanded ? "true" : "false"}">
        ${label}
      </button>
      <ol class="log-list" aria-label="HR activity log">${rows}</ol>
      ${canExpand && !expanded ? `<button type="button" class="log-more" data-action="toggle-log">${entries.length - 3} older · expand</button>` : ""}
    </section>
  `;
}
