import type { EmployeeId, PipDays, Zone } from "./types";
import { playPaperShuffle } from "./lib/audio";
import { prefersReducedMotion } from "./lib/dom";
import { enqueue } from "./state/queue";
import { zoneAt } from "./state/layout";
import {
  beginPendingTermination,
  clearPendingTermination,
  closeQuarter,
  consumePendingTermination,
  getState,
  loadState,
  promote,
  putOnPip,
  relocate,
  resetCompany,
  resolvePip,
  subscribe,
  terminate,
  toggleSound,
  writeReview,
} from "./state/store";
import { renderHeader } from "./ui/header";
import { empTransform, isFeatured, renderDeskSvg } from "./ui/desk";
import { renderPanel, type FormMode } from "./ui/panel";
import { renderActivityLog } from "./ui/activity-log";
import { renderConfirm } from "./ui/confirm";
import { renderBanner } from "./ui/banner";
import { renderAccess } from "./ui/access";
import { startWebMcp } from "./webmcp/register";
import { detectSeed } from "./data/seeds";
import { setPersonnelFileOpener } from "./ui/file";

interface UiState {
  selectedId: EmployeeId | null;
  form: FormMode;
  logOpen: boolean;
}

const ui: UiState = {
  selectedId: null,
  form: null,
  logOpen: true,
};

let skipNextClick = false;
let lastFollowedLog = "";

function isEmployeeId(value: string): value is EmployeeId {
  return Boolean(getState().employees[value as EmployeeId]);
}

function lines(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function followAgent(state: ReturnType<typeof getState>): void {
  const latest = state.activity[0];
  if (!latest || latest.id === lastFollowedLog) return;
  lastFollowedLog = latest.id;
  if (latest.actor === "agent" && latest.employeeId) {
    ui.selectedId = latest.employeeId;
    ui.form = null;
  }
}

function render(): void {
  const state = getState();
  followAgent(state);
  const header = document.querySelector<HTMLElement>("[data-header]");
  const banner = document.querySelector<HTMLElement>("[data-banner]");
  const access = document.querySelector<HTMLElement>("[data-access]");
  const scene = document.querySelector<HTMLElement>("[data-scene]");
  const panel = document.querySelector<HTMLElement>("[data-panel]");
  const log = document.querySelector<HTMLElement>("[data-log]");
  const modal = document.querySelector<HTMLElement>("[data-modal]");
  if (!header || !scene || !panel || !log || !modal || !banner) return;
  if (ui.selectedId && !state.employees[ui.selectedId]) {
    ui.selectedId = null;
    ui.form = null;
  }
  header.innerHTML = renderHeader(state);
  banner.innerHTML = renderBanner();
  if (access) access.innerHTML = renderAccess();
  const prior = new Map<string, string>();
  scene.querySelectorAll<SVGGElement>(".emp").forEach((el) => {
    if (el.dataset.id && el.style.transform) prior.set(el.dataset.id, el.style.transform);
  });
  scene.innerHTML = renderDeskSvg(state, ui.selectedId);
  if (!prefersReducedMotion()) {
    scene.querySelectorAll<SVGGElement>(".emp").forEach((el) => {
      const id = el.dataset.id;
      const next = el.style.transform;
      const prev = id ? prior.get(id) : undefined;
      if (!prev || !next || prev === next) return;
      el.style.transition = "none";
      el.style.transform = prev;
      el.getBoundingClientRect();
      el.style.transition = "";
      el.style.transform = next;
    });
  }
  const keepForm = Boolean(ui.form && ui.selectedId && state.activity[0]?.actor !== "agent");
  if (!keepForm) {
    panel.innerHTML = renderPanel(ui.selectedId, state, ui.form);
  }
  log.innerHTML = renderActivityLog(state.activity, ui.logOpen);
  const pending = state.pendingTermination;
  modal.innerHTML = pending ? renderConfirm(pending.employeeId, pending.reason) : "";
  bindDrag(scene.querySelector("svg"));
}

function svgPoint(svg: SVGSVGElement, event: PointerEvent): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const loc = pt.matrixTransform(ctm.inverse());
  return { x: loc.x, y: loc.y };
}

function bindDrag(svg: SVGSVGElement | null): void {
  if (!svg) return;
  let dragging: { id: EmployeeId; startX: number; startY: number; moved: boolean; el: SVGGElement } | null = null;

  svg.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const group = target.closest<SVGGElement>(".emp");
    const id = group?.dataset.id;
    if (!group || !id || !isEmployeeId(id)) return;
    const emp = getState().employees[id];
    if (!emp || emp.standing === "terminated") return;
    const point = svgPoint(svg, event);
    dragging = { id, startX: point.x, startY: point.y, moved: false, el: group };
    group.setPointerCapture(event.pointerId);
  });

  svg.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const point = svgPoint(svg, event);
    const dx = point.x - dragging.startX;
    const dy = point.y - dragging.startY;
    if (Math.hypot(dx, dy) > 6) dragging.moved = true;
    if (!dragging.moved) return;
    dragging.el.classList.add("is-dragging");
    const emp = getState().employees[dragging.id];
    if (!emp) return;
    dragging.el.style.transform = empTransform(
      { x: emp.pose.x + dx, y: emp.pose.y + dy, rotate: emp.pose.rotate },
      isFeatured(getState(), dragging.id),
    );
  });

  const endDrag = (event: PointerEvent) => {
    if (!dragging) return;
    const current = dragging;
    dragging = null;
    current.el.classList.remove("is-dragging");
    if (!current.moved) return;
    event.preventDefault();
    skipNextClick = true;
    const point = svgPoint(svg, event);
    const zone = zoneAt(point.x, point.y);
    void enqueue(() => {
      if (zone === "sink") {
        beginPendingTermination(
          current.id,
          "Relocated to the Donated / Sink box by upper management.",
          "human",
        );
        return;
      }
      const pose = getState().employees[current.id]?.pose;
      relocate(current.id, zone, "human", { x: point.x - 24, y: point.y - 24, rotate: pose?.rotate ?? 0 });
    });
  };

  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
}

function selectEmployee(id: EmployeeId | null): void {
  ui.selectedId = id;
  ui.form = null;
  render();
}

function onActivate(target: EventTarget | null): void {
  if (skipNextClick) {
    skipNextClick = false;
    return;
  }
  const el = target instanceof Element ? target.closest("[data-id]") : null;
  const id = el?.getAttribute("data-id");
  if (typeof id === "string" && isEmployeeId(id)) {
    selectEmployee(id);
  }
}

function handleForm(form: HTMLFormElement): void {
  const kind = form.dataset.hrForm;
  const id = form.dataset.id;
  if (!id || !isEmployeeId(id) || !kind) return;
  const data = new FormData(form);
  void enqueue(() => {
    if (kind === "review") {
      const rating = Number(data.get("rating")) as 1 | 2 | 3 | 4 | 5;
      writeReview(
        id,
        {
          rating,
          summary: String(data.get("summary") ?? ""),
          strengths: lines(data.get("strengths")),
          concerns: lines(data.get("concerns")),
        },
        "human",
      );
      playPaperShuffle(getState().soundEnabled);
    } else if (kind === "pip") {
      putOnPip(
        id,
        {
          reason: String(data.get("reason") ?? ""),
          goals: lines(data.get("goals")),
          days: Number(data.get("days")) as PipDays,
        },
        "human",
      );
      playPaperShuffle(getState().soundEnabled);
    } else if (kind === "relocate") {
      relocate(id, String(data.get("zone")) as Zone, "human");
    } else if (kind === "terminate") {
      beginPendingTermination(id, String(data.get("reason") ?? ""), "human");
    }
    ui.form = null;
    render();
  });
}

export function mount(root: HTMLElement): void {
  loadState(detectSeed());
  setPersonnelFileOpener((id) => {
    if (!getState().employees[id]) return;
    selectEmployee(id);
  });
  startWebMcp();
  root.innerHTML = `
    <div data-header></div>
    <div data-banner></div>
    <div data-access></div>
    <main class="workspace">
      <section class="scene" data-scene></section>
      <div data-panel></div>
    </main>
    <div data-log></div>
    <div data-modal></div>
  `;

  subscribe(() => render());
  render();

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest("[data-action=close-panel]")) {
      selectEmployee(null);
      return;
    }
    if (target.closest("[data-action=cancel-form]")) {
      ui.form = null;
      render();
      return;
    }
    if (target.closest("[data-action=toggle-log]")) {
      ui.logOpen = !ui.logOpen;
      render();
      return;
    }
    if (target.closest("[data-action=toggle-sound]")) {
      toggleSound();
      return;
    }
    if (target.closest("[data-action=close-quarter]")) {
      closeQuarter("human");
      return;
    }
    if (target.closest("[data-action=reset-company]")) {
      if (window.confirm("Reset Desk 4B to a clean quarter? This clears reviews, PIPs, and alumni.")) {
        resetCompany("human");
        ui.selectedId = null;
        ui.form = null;
        render();
      }
      return;
    }
    if (target.closest("[data-action=confirm-terminate]")) {
      const pending = consumePendingTermination();
      if (!pending) return;
      void enqueue(() => {
        terminate(pending.employeeId, pending.reason, "human");
        playPaperShuffle(getState().soundEnabled);
      });
      return;
    }
    if (target.closest("[data-action=cancel-terminate]")) {
      clearPendingTermination();
      return;
    }

    const formBtn = target.closest<HTMLElement>("[data-form]");
    if (formBtn && ui.selectedId) {
      const mode = formBtn.dataset.form;
      if (mode === "review" || mode === "pip" || mode === "relocate" || mode === "terminate") {
        ui.form = mode;
        render();
        return;
      }
      if (mode === "promote") {
        const title = window.prompt("New title", getState().employees[ui.selectedId]?.title ?? "");
        if (title) {
          void enqueue(() => promote(ui.selectedId!, title, "human"));
        }
        return;
      }
      if (mode === "resolve-pass") {
        void enqueue(() => resolvePip(ui.selectedId!, "passed", "human"));
        return;
      }
      if (mode === "resolve-fail") {
        void enqueue(() => resolvePip(ui.selectedId!, "failed", "human"));
        return;
      }
    }

    if (!target.closest("[data-hr-form]")) {
      onActivate(target);
    }
  });

  root.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.dataset.hrForm) return;
    event.preventDefault();
    handleForm(form);
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      clearPendingTermination();
      ui.form = null;
      ui.selectedId = null;
      render();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      const target = event.target;
      if (target instanceof Element && target.closest(".emp")) {
        event.preventDefault();
        onActivate(target);
      }
    }
  });
}


