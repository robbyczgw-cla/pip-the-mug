import type { EmployeeId } from "./types";
import { EMPLOYEE_IDS } from "./types";
import { renderHeader } from "./ui/header";
import { renderDeskSvg } from "./ui/desk";
import { renderPanel } from "./ui/panel";

interface UiState {
  selectedId: EmployeeId | null;
}

const ui: UiState = {
  selectedId: null,
};

function isEmployeeId(value: string | undefined): value is EmployeeId {
  return EMPLOYEE_IDS.includes(value as EmployeeId);
}

function render(): void {
  const scene = document.querySelector<HTMLElement>("[data-scene]");
  const panel = document.querySelector<HTMLElement>("[data-panel]");
  if (!scene || !panel) return;
  scene.innerHTML = renderDeskSvg(ui.selectedId);
  panel.innerHTML = renderPanel(ui.selectedId);
}

function select(id: EmployeeId | null): void {
  ui.selectedId = id;
  render();
  if (id) {
    document.querySelector<HTMLElement>(".panel")?.focus();
  }
}

function onActivate(target: EventTarget | null): void {
  const el = target instanceof Element ? target.closest("[data-id]") : null;
  const id = el?.getAttribute("data-id");
  if (typeof id === "string" && isEmployeeId(id)) {
    select(id);
  }
}

export function mount(root: HTMLElement): void {
  root.innerHTML = `
    ${renderHeader()}
    <main class="workspace">
      <section class="scene" data-scene></section>
      <div data-panel></div>
    </main>
  `;

  render();

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-action=close-panel]")) {
      select(null);
      return;
    }
    onActivate(target);
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      select(null);
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
