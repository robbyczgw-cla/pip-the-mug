import { STAFF_BY_ID } from "../data/staff.ts";
import { escapeHtml } from "../lib/dom.ts";
import type { EmployeeRuntime, PaperItem, PipRecord, ReviewRecord, TerminationRecord } from "../types.ts";

function checks(items: string[]): string {
  if (items.length === 0) return `<p class="muted">None listed.</p>`;
  return `<div class="checks">${items
    .map((item) => `<label><input type="checkbox" checked disabled /> ${escapeHtml(item)}</label>`)
    .join("")}</div>`;
}

export function renderReviewPaper(emp: EmployeeRuntime, review: ReviewRecord): string {
  const record = STAFF_BY_ID[emp.id];
  return `
    <article class="paperwork" aria-label="Performance review">
      <p class="form-id">Form PR-12 · Desktop Holdings LLC · Q${review.quarter} FY26</p>
      <h4>Performance review</h4>
      <p><strong>Employee:</strong> ${escapeHtml(record.name)} · ${escapeHtml(emp.title)}</p>
      <p><strong>Overall rating:</strong> ${review.rating} / 5</p>
      <p>${escapeHtml(review.summary)}</p>
      <p><strong>Strengths</strong></p>
      ${checks(review.strengths)}
      <p><strong>Areas of concern</strong></p>
      ${checks(review.concerns)}
      <div class="sig">
        Reviewed by Upper Management
        <div class="sig-line">Upper Management</div>
      </div>
    </article>
  `;
}

export function renderPipPaper(emp: EmployeeRuntime, pip: PipRecord): string {
  const record = STAFF_BY_ID[emp.id];
  const status = pip.outcome ? pip.outcome.toUpperCase() : "OPEN";
  return `
    <article class="paperwork" aria-label="Performance improvement plan">
      <p class="form-id">Form PIP-90 · Confidential · ${pip.days}-day plan</p>
      <h4>Performance Improvement Plan</h4>
      <p><strong>Employee:</strong> ${escapeHtml(record.name)}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Reason:</strong> ${escapeHtml(pip.reason)}</p>
      <p><strong>Goals</strong></p>
      ${checks(pip.goals)}
      <div class="sig">
        Acknowledgement does not imply agreement.
        <div class="sig-line">Upper Management</div>
      </div>
    </article>
  `;
}

export function renderTerminationPaper(emp: EmployeeRuntime, record: TerminationRecord): string {
  const staff = STAFF_BY_ID[emp.id];
  return `
    <article class="paperwork" aria-label="Termination letter">
      <p class="form-id">Form SEP-1 · Separation notice</p>
      <h4>Notice of separation</h4>
      <p>Effective immediately, ${escapeHtml(staff.name)} is separated from Desk 4B.</p>
      <p><strong>Reason:</strong> ${escapeHtml(record.reason)}</p>
      <p>Personal effects are to be placed in the Donated / Sink box. Access to the blotter is revoked.</p>
      <p>This copy is for the alumni wall.</p>
      <div class="sig">
        <div class="sig-line">Upper Management</div>
      </div>
    </article>
  `;
}

export function paperFor(item: PaperItem, emp: EmployeeRuntime, alumni: TerminationRecord[]): string {
  if (item.kind === "review" && emp.reviews[0]) return renderReviewPaper(emp, emp.reviews[0]);
  if (item.kind === "pip" && emp.pips[0]) return renderPipPaper(emp, emp.pips[0]);
  if (item.kind === "termination") {
    const term = alumni.find((row) => row.employeeId === emp.id);
    if (term) return renderTerminationPaper(emp, term);
  }
  return "";
}
