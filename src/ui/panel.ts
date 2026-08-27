import { STAFF_BY_ID } from "../data/staff.ts";
import { escapeHtml } from "../lib/dom.ts";
import type { CompanyState, EmployeeId, Zone } from "../types.ts";
import { activePip, canTerminate } from "../state/store.ts";
import { renderIdentitySvg } from "./svg-objects.ts";
import { hasSprite, spriteHref } from "./sprites.ts";
import {
  renderPipPaper,
  renderReviewPaper,
  renderTerminationPaper,
} from "./paperwork.ts";

export type FormMode = "review" | "pip" | "relocate" | "terminate" | null;

function stars(rating: number): string {
  return "●".repeat(rating) + "○".repeat(5 - rating);
}

export function renderPanel(
  selectedId: EmployeeId | null,
  state: CompanyState,
  form: FormMode,
): string {
  if (!selectedId) {
    return `
      <aside class="panel panel-empty" aria-label="Personnel file">
        <p class="panel-kicker">Personnel file</p>
        <h2>Select an employee</h2>
        <p class="lede">
          Click a desk object to open its file. You are upper management.
          Drag objects between zones, or let your browser agent run HR.
        </p>
        <ol class="howto">
          <li>Click or tab to an object.</li>
          <li>File a review, a PIP, a promotion, or a relocation.</li>
          <li>Termination needs a confirmation click.</li>
        </ol>
      </aside>
    `;
  }

  const record = STAFF_BY_ID[selectedId];
  const emp = state.employees[selectedId];
  if (!record || !emp) {
    return `
      <aside class="panel panel-empty" aria-label="Personnel file">
        <p class="panel-kicker">Personnel file</p>
        <h2>Select an employee</h2>
        <p class="lede">That file is not on this desk.</p>
      </aside>
    `;
  }
  const manager = emp.reportsTo && emp.standing !== "terminated" ? STAFF_BY_ID[emp.reportsTo] : null;
  const open = activePip(emp);
  const term = state.alumni.find((row) => row.employeeId === selectedId);
  const thumb = hasSprite(record.id)
    ? `<img class="identity-img" alt="" src="${spriteHref(record.id)}" width="88" height="88" />`
    : `<svg class="identity-svg" viewBox="0 0 64 64" aria-hidden="true">${renderIdentitySvg(record.id)}</svg>`;

  const backstory = record.backstory.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");

  const liveReviews = emp.reviews.slice(emp.reviews[0] ? 1 : 0).map(
    (review) => `
      <article class="file-card">
        <header>
          <span>Q${review.quarter} FY26 · live</span>
          <span class="rating" aria-label="Rating ${review.rating} of 5">${stars(review.rating)}</span>
        </header>
        <p>${escapeHtml(review.summary)}</p>
      </article>
    `,
  );
  const histReviews = record.pastReviews.map(
    (review) => `
      <article class="file-card">
        <header>
          <span>${escapeHtml(review.quarter)}</span>
          <span class="rating" aria-label="Rating ${review.rating} of 5">${stars(review.rating)}</span>
        </header>
        <p>${escapeHtml(review.summary)}</p>
      </article>
    `,
  );
  const reviews =
    liveReviews.length + histReviews.length === 0
      ? `<p class="muted">None on file.</p>`
      : `${liveReviews.join("")}${histReviews.join("")}`;

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

  const failedPip = !open && emp.pips[0]?.outcome === "failed";
  const standingLabel =
    emp.standing === "on_pip" && open
      ? `On PIP (${open.days} days)`
      : failedPip
        ? "PIP failed · awaiting separation"
        : emp.standing === "terminated"
          ? "Terminated · alumni"
          : "Active";

  const pipActions = open
    ? `<button type="button" class="ghost-btn" data-form="resolve-pass">PIP passed</button>
                    <button type="button" class="ghost-btn" data-form="resolve-fail">PIP failed</button>`
    : failedPip
      ? ""
      : `<button type="button" class="ghost-btn" data-form="pip">Put on PIP</button>`;

  const actions =
    emp.standing === "terminated"
      ? `<p class="muted">This file is closed. Tools for this object are no longer registered.</p>`
      : `
        <div class="actions">
          <button type="button" class="solid-btn" data-form="review">Write review</button>
          ${pipActions}
          <button type="button" class="ghost-btn" data-form="promote">Promote</button>
          <button type="button" class="ghost-btn" data-form="relocate">Relocate</button>
          ${
            canTerminate(emp, state.quarter)
              ? `<button type="button" class="solid-btn danger" data-form="terminate">Terminate</button>`
              : `<p class="muted">Termination locked: promoted this quarter.</p>`
          }
        </div>
      `;

  return `
    <aside class="panel" aria-label="Personnel file for ${escapeHtml(record.name)}" role="region" tabindex="-1">
      <header class="panel-head">
        <p class="panel-kicker">Form HR-7B · Personnel file</p>
        <button type="button" class="icon-btn" data-action="close-panel" aria-label="Close personnel file">Close</button>
      </header>

      <div class="identity">
        ${thumb}
        <div>
          <h2>${escapeHtml(record.name)}</h2>
          <p class="role">${escapeHtml(emp.title)}</p>
          <p class="meta">${escapeHtml(record.department)} · Tenure: ${escapeHtml(record.tenure)}</p>
          <p class="standing"><span class="pip-dot ${emp.standing}"></span> Standing: ${standingLabel}</p>
        </div>
      </div>

      <dl class="facts">
        <div><dt>Employee ID</dt><dd>${escapeHtml(record.id)}</dd></div>
        <div><dt>Reports to</dt><dd>${manager ? escapeHtml(manager.name) : emp.standing === "terminated" ? "Alumni wall" : "— Board / the wall —"}</dd></div>
        <div><dt>Zone</dt><dd>${escapeHtml(emp.zone)}</dd></div>
        <div><dt>Pronouns</dt><dd>${escapeHtml(record.pronouns)}</dd></div>
      </dl>

      ${formBlock(selectedId, form)}
      ${actions}

      ${emp.reviews[0] ? renderReviewPaper(emp, emp.reviews[0]) : ""}
      ${open ? renderPipPaper(emp, open) : emp.pips[0] ? renderPipPaper(emp, emp.pips[0]) : ""}
      ${term ? renderTerminationPaper(emp, term) : ""}

      <section>
        <h3>Narrative</h3>
        <div class="prose">${backstory}</div>
      </section>

      <section>
        <h3>Reviews</h3>
        ${reviews}
      </section>

      <section>
        <h3>Incidents</h3>
        ${incidents}
      </section>
    </aside>
  `;
}

function formBlock(id: EmployeeId, form: FormMode): string {
  if (form === "review") {
    return `
      <form class="paperwork" data-hr-form="review" data-id="${id}">
        <p class="form-id">Form PR-12 · live entry</p>
        <h4>Write review</h4>
        <label>Rating
          <select name="rating" required>
            <option value="1">1 — Unsatisfactory</option>
            <option value="2">2 — Needs improvement</option>
            <option value="3" selected>3 — Meets</option>
            <option value="4">4 — Exceeds</option>
            <option value="5">5 — Distinguished</option>
          </select>
        </label>
        <label>Summary
          <textarea name="summary" rows="3" required></textarea>
        </label>
        <label>Strengths (one per line)
          <textarea name="strengths" rows="2"></textarea>
        </label>
        <label>Concerns (one per line)
          <textarea name="concerns" rows="2"></textarea>
        </label>
        <div class="actions">
          <button type="submit" class="solid-btn">File review</button>
          <button type="button" class="icon-btn" data-action="cancel-form">Cancel</button>
        </div>
        <div class="sig"><div class="sig-line">Upper Management</div></div>
      </form>
    `;
  }
  if (form === "pip") {
    return `
      <form class="paperwork" data-hr-form="pip" data-id="${id}">
        <p class="form-id">Form PIP-90 · live entry</p>
        <h4>Performance Improvement Plan</h4>
        <label>Reason
          <textarea name="reason" rows="2" required></textarea>
        </label>
        <label>Goals (one per line)
          <textarea name="goals" rows="3" required></textarea>
        </label>
        <label>Duration
          <select name="days">
            <option value="30">30 days</option>
            <option value="60" selected>60 days</option>
            <option value="90">90 days</option>
          </select>
        </label>
        <div class="actions">
          <button type="submit" class="solid-btn">Issue PIP</button>
          <button type="button" class="icon-btn" data-action="cancel-form">Cancel</button>
        </div>
        <div class="sig"><div class="sig-line">Upper Management</div></div>
      </form>
    `;
  }
  if (form === "relocate") {
    const zones: Zone[] = ["prime", "standard", "shelf", "drawer"];
    return `
      <form class="paperwork" data-hr-form="relocate" data-id="${id}">
        <p class="form-id">Form REL-3</p>
        <h4>Relocate</h4>
        <label>Zone
          <select name="zone">${zones.map((zone) => `<option value="${zone}">${zone}</option>`).join("")}</select>
        </label>
        <div class="actions">
          <button type="submit" class="solid-btn">Move</button>
          <button type="button" class="icon-btn" data-action="cancel-form">Cancel</button>
        </div>
      </form>
    `;
  }
  if (form === "terminate") {
    return `
      <form class="paperwork" data-hr-form="terminate" data-id="${id}">
        <p class="form-id">Form SEP-1 · requires confirmation</p>
        <h4>Termination packet</h4>
        <label>Reason
          <textarea name="reason" rows="3" required></textarea>
        </label>
        <div class="actions">
          <button type="submit" class="solid-btn danger">Prepare termination</button>
          <button type="button" class="icon-btn" data-action="cancel-form">Cancel</button>
        </div>
      </form>
    `;
  }
  return "";
}
