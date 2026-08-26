import { COMPANY } from "../data/staff";

const TICKER =
  "Q3 FY26 · All reviews due Friday · Form 19-B required for mug-related incidents · Do not water the morale officer without a ticket · Stapler is probably ours ·";

export function renderHeader(): string {
  return `
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        <div>
          <p class="company">${COMPANY.legalName}</p>
          <h1>PIP the Mug</h1>
        </div>
      </div>
      <p class="desk-tag">${COMPANY.desk} · ${COMPANY.fiscalYear} · Quarter 3</p>
      <div class="ticker" aria-label="HR compliance ticker">
        <div class="ticker-track">
          <span>${TICKER}</span>
          <span aria-hidden="true">${TICKER}</span>
        </div>
      </div>
    </header>
  `;
}
