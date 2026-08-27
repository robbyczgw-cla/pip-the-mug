import assert from "node:assert/strict";
import { test } from "node:test";
import { Window } from "happy-dom";
import type { EmployeeId } from "../types.ts";
import { loadState, getState, terminate, resetCompany } from "../state/store.ts";
import { setPersonnelFileOpener } from "../ui/file.ts";
import { renderPanel } from "../ui/panel.ts";
import { renderDeskSvg } from "../ui/desk.ts";
import { buildTools } from "./tools.ts";

type ToolResult = {
  ok: boolean;
  summary: string;
  file?: { id: string; standing: string; openPip?: { days: number } | null };
};

function installBrowser(): void {
  const happy = new Window({ url: "http://127.0.0.1:4173/?demo=1" });
  const g = globalThis as typeof globalThis & { window: Window; document: Document };
  g.window = happy;
  g.document = happy.document as unknown as Document;
  happy.localStorage.clear();
  Object.defineProperty(globalThis, "localStorage", { value: happy.localStorage, configurable: true });
}

function paint(id: EmployeeId): void {
  const state = getState();
  const panel = document.querySelector("[data-panel]");
  const scene = document.querySelector("[data-scene]");
  assert.ok(panel);
  assert.ok(scene);
  panel.innerHTML = renderPanel(id, state, null);
  scene.innerHTML = renderDeskSvg(state, id);
}

async function getFile(id: string): Promise<ToolResult> {
  const tool = buildTools().find((item) => item.name === "get_personnel_file");
  assert.ok(tool);
  return tool.execute({ id }) as Promise<ToolResult>;
}

function panelText(): string {
  return document.querySelector("[data-panel]")?.innerHTML ?? "";
}

function emp(id: string): Element {
  const el = document.querySelector(`.emp[data-id="${id}"]`);
  assert.ok(el, `missing desk object ${id}`);
  return el;
}

function setup(seed: "demo" | "qa"): void {
  installBrowser();
  document.body.innerHTML = `<div data-panel></div><div data-scene></div>`;
  setPersonnelFileOpener(paint);
  loadState(seed);
  const panel = document.querySelector("[data-panel]");
  assert.ok(panel);
  panel.innerHTML = `<aside class="panel panel-empty"><h2>Select an employee</h2></aside>`;
}

test("get_personnel_file opens the visible Mug and Plant files on the demo seed", async () => {
  setup("demo");
  assert.match(panelText(), /Select an employee/);
  const activityBefore = getState().activity.length;
  const papersBefore = getState().papers.length;

  const mug = await getFile("mug");
  assert.equal(mug.ok, true);
  assert.equal(mug.file?.id, "mug");
  assert.match(panelText(), /Personnel file for Mug/);
  assert.equal(emp("mug").getAttribute("aria-pressed"), "true");
  assert.equal(emp("mug").classList.contains("is-selected"), true);
  assert.equal(getState().activity.length, activityBefore);
  assert.equal(getState().papers.length, papersBefore);

  const plant = await getFile("plant");
  assert.equal(plant.ok, true);
  assert.equal(plant.file?.openPip?.days, 60);
  assert.match(panelText(), /Personnel file for Desk Plant/);
  assert.match(panelText(), /On PIP \(60 days\)/);
  assert.equal(emp("plant").getAttribute("aria-pressed"), "true");
  assert.equal(emp("mug").getAttribute("aria-pressed"), "false");
  assert.equal(document.querySelectorAll("[data-panel]").length, 1);
  assert.equal(document.querySelectorAll(".panel").length, 1);

  terminate("mug", "test", "human");
  const alumni = await getFile("mug");
  assert.equal(alumni.ok, true);
  assert.equal(alumni.file?.standing, "terminated");
  assert.match(panelText(), /Personnel file for Mug/);
  assert.match(panelText(), /Terminated · alumni|This file is closed/);
  assert.equal(emp("mug").getAttribute("aria-pressed"), "true");
});

test("get_personnel_file opens files on the QA seed", async () => {
  setup("qa");
  const result = await getFile("stapler");
  assert.equal(result.ok, true);
  assert.equal(result.file?.id, "stapler");
  assert.match(panelText(), /Personnel file for Stapler/);
  assert.equal(emp("stapler").getAttribute("aria-pressed"), "true");
  resetCompany("human");
});
