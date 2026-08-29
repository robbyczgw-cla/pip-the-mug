import { STAFF_BY_ID } from "../data/staff";
import { escapeHtml } from "../lib/dom";
import type { EmployeeId } from "../types";

export function renderConfirm(id: EmployeeId, reason: string): string {
  const record = STAFF_BY_ID[id];
  return `
    <div class="modal-back" role="dialog" aria-modal="true" aria-labelledby="term-title">
      <div class="modal sep-form">
        <p class="panel-kicker">Human confirmation required · Form SEP-1</p>
        <h2 id="term-title">Terminate ${escapeHtml(record.name)}?</h2>
        <p>The WebMCP tool has stopped here. Upper management must make the decision on this page. ${escapeHtml(record.name)} stays employed until you do.</p>
        <p><strong>Reason on file:</strong> ${escapeHtml(reason)}</p>
        <div class="actions">
          <button type="button" class="solid-btn danger" data-action="confirm-terminate">Confirm termination</button>
          <button type="button" class="icon-btn" data-action="cancel-terminate">Keep employed</button>
        </div>
      </div>
    </div>
  `;
}
