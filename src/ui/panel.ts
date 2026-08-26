import { STAFF_BY_ID } from "../data/staff";
import { escapeHtml } from "../lib/dom";
import type { EmployeeId } from "../types";
import { renderObjectSvg } from "./svg-objects";

function stars(rating: number): string {
  return "●".repeat(rating) + "○".repeat(5 - rating);
}

export function renderPanel(selectedId: EmployeeId | null): string {
  if (!selectedId) {
    return `
      <aside class="panel panel-empty" aria-label="Personnel file">
        <p class="panel-kicker">Personnel file</p>
        <h2>Select an employee</h2>
        <p class="lede">
          Click a desk object to open its file. You are upper management.
          The objects work here. Some of them.
        </p>
        <ol class="howto">
          <li>Click or tab to an object.</li>
          <li>Read the file. It is complete, if not current.</li>
          <li>HR actions arrive in a later packet.</li>
        </ol>
      </aside>
    `;
  }

  const record = STAFF_BY_ID[selectedId];
  const manager = record.reportsTo ? STAFF_BY_ID[record.reportsTo] : null;
  const backstory = record.backstory
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");

  const reviews =
    record.pastReviews.length === 0
      ? `<p class="muted">None on file.</p>`
      : record.pastReviews
          .map(
            (review) => `
              <article class="file-card">
                <header>
                  <span>${escapeHtml(review.quarter)}</span>
                  <span class="rating" aria-label="Rating ${review.rating} of 5">${stars(review.rating)}</span>
                </header>
                <p>${escapeHtml(review.summary)}</p>
              </article>
            `,
          )
          .join("");

  const incidents =
    record.incidents.length === 0
      ? `<p class="muted">None recorded.</p>`
      : record.incidents
          .map(
            (incident) => `
              <article class="file-card">
                <header><span>${escapeHtml(incident.date)}</span></header>
                <p>${escapeHtml(incident.note)}</p>
              </article>
            `,
          )
          .join("");

  return `
    <aside class="panel" aria-label="Personnel file for ${escapeHtml(record.name)}" role="region">
      <header class="panel-head">
        <p class="panel-kicker">Form HR-7B · Personnel file</p>
        <button type="button" class="icon-btn" data-action="close-panel" aria-label="Close personnel file">
          Close
        </button>
      </header>

      <div class="identity">
        <svg class="identity-svg" viewBox="-8 -8 120 100" aria-hidden="true">
          ${renderObjectSvg(record.id, false)}
        </svg>
        <div>
          <h2>${escapeHtml(record.name)}</h2>
          <p class="role">${escapeHtml(record.role)}</p>
          <p class="meta">${escapeHtml(record.department)} · Tenure: ${escapeHtml(record.tenure)}</p>
          <p class="standing"><span class="pip-dot active"></span> Standing: Active</p>
        </div>
      </div>

      <dl class="facts">
        <div><dt>Employee ID</dt><dd>${escapeHtml(record.id)}</dd></div>
        <div><dt>Reports to</dt><dd>${manager ? escapeHtml(manager.name) : "— Board / the wall —"}</dd></div>
        <div><dt>Home zone</dt><dd>${escapeHtml(record.defaultZone)}</dd></div>
        <div><dt>Pronouns</dt><dd>${escapeHtml(record.pronouns)}</dd></div>
      </dl>

      <section>
        <h3>Narrative</h3>
        <div class="prose">${backstory}</div>
      </section>

      <section>
        <h3>Prior reviews</h3>
        ${reviews}
      </section>

      <section>
        <h3>Incidents</h3>
        ${incidents}
      </section>
    </aside>
  `;
}
