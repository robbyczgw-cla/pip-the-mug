import { clockLabel } from "../lib/id";
import { escapeHtml } from "../lib/dom";
import type { ActivityEntry } from "../types";

export function renderActivityLog(entries: ActivityEntry[], open: boolean): string {
  const rows =
    entries.length === 0
      ? `<li class="muted">No HR actions yet this quarter.</li>`
      : entries
          .map(
            (entry) => `
              <li>
                <span>${escapeHtml(clockLabel(entry.at))}</span>
                <span class="actor-${entry.actor}">${entry.actor === "agent" ? "Agent" : "Human"}</span>
                <span><strong>${escapeHtml(entry.tool)}</strong> — ${escapeHtml(entry.summary)}</span>
              </li>
            `,
          )
          .join("");

  return `
    <section class="log-wrap">
      <button type="button" class="log-toggle" data-action="toggle-log" aria-expanded="${open ? "true" : "false"}">
        HR Activity Log ${open ? "▾" : "▸"} · ${entries.length} entries
      </button>
      ${open ? `<ol class="log-list" aria-label="HR activity log">${rows}</ol>` : ""}
    </section>
  `;
}
