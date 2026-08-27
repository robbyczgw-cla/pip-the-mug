import { COMPANY } from "../data/staff";
import { escapeHtml } from "../lib/dom";
import { STAFF_BY_ID } from "../data/staff";
import type { CompanyState } from "../types";

const TICKER =
  "Q3 FY26 · All reviews due Friday · Form 19-B required for mug-related incidents · Do not water the morale officer without a ticket · Stapler is probably ours · Termination requires Upper Management confirmation ·";

export function renderHeader(state: CompanyState): string {
  const lead = STAFF_BY_ID[state.deskLeadId];
  return `
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        <div>
          <p class="company">${COMPANY.legalName}</p>
          <h1>PIP the Mug</h1>
        </div>
      </div>
      <p class="desk-tag">${COMPANY.desk} · Q${state.quarter} ${COMPANY.fiscalYear} · Lead: ${escapeHtml(lead.name)}</p>
      <div class="ticker" aria-label="HR compliance ticker">
        <div class="ticker-track">
          <span>${TICKER}</span>
          <span aria-hidden="true">${TICKER}</span>
        </div>
      </div>
      <div class="topbar-actions">
        <button type="button" class="ghost-btn" data-action="toggle-sound" aria-pressed="${state.soundEnabled}">
          Sound ${state.soundEnabled ? "on" : "off"}
        </button>
        <button type="button" class="ghost-btn" data-action="close-quarter">Close quarter</button>
        <button type="button" class="ghost-btn" data-action="reset-company">Reset company</button>
      </div>
    </header>
  `;
}
