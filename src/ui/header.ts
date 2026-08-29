import { COMPANY } from "../data/staff";
import { escapeHtml } from "../lib/dom";
import { STAFF_BY_ID } from "../data/staff";
import type { CompanyState, DeskSeed } from "../types";

function ticker(seed: DeskSeed, quarter: number): string {
  const extras =
    seed === "demo"
      ? " Webcam cover stays on during standups ·"
      : " Stapler is probably ours ·";
  return `Q${quarter} FY26 · All reviews due Friday · Form 19-B required for mug-related incidents · Do not water the morale officer without a ticket ·${extras} Termination requires Upper Management confirmation ·`;
}

function seedLabel(state: CompanyState): string {
  const roster = Object.keys(state.employees).length;
  const live = Object.values(state.employees).filter((emp) => emp && emp.standing !== "terminated").length;
  if (state.seed === "demo") return `Public demo · ${roster}`;
  if (state.seed === "qa") return `QA seed · ${roster}`;
  return `${live} on desk`;
}

export function renderHeader(state: CompanyState): string {
  const lead = STAFF_BY_ID[state.deskLeadId] ?? STAFF_BY_ID.monitor;
  const copy = ticker(state.seed, state.quarter);
  return `
    <header class="topbar">
      <div class="brand">
        <img class="brand-mark" src="/logo.png" width="40" height="40" alt="PIP the Mug" />
        <div>
          <p class="company">${COMPANY.legalName}</p>
          <h1>PIP the Mug</h1>
        </div>
      </div>
      <p class="desk-tag">${COMPANY.desk} · Q${state.quarter} ${COMPANY.fiscalYear} · Lead: ${escapeHtml(lead.name)} · ${seedLabel(state)}</p>
      <div class="ticker" aria-label="HR compliance ticker">
        <div class="ticker-track">
          <span>${copy}</span>
          <span aria-hidden="true">${copy}</span>
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
