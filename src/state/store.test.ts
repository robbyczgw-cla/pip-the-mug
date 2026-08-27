import assert from "node:assert/strict";
import { test } from "node:test";
import { orgChart, listStaffRows } from "./org.ts";
import { createDefaultState, getState, loadState, resetCompany, resolvePip, rosterIds, terminate } from "./store.ts";

function installStorage(): Map<string, string> {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
  };
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  return mem;
}

test("demo default has eight people and the public reporting lines", () => {
  const state = createDefaultState("demo");
  assert.equal(rosterIds(state).length, 8);
  assert.equal(state.employees.mug?.reportsTo, "monitor");
  assert.equal(state.employees.plant?.reportsTo, "monitor");
  assert.equal(state.employees["usb-hub"]?.reportsTo, "monitor");
  assert.equal(state.employees["webcam-cover"]?.reportsTo, "monitor");
  assert.equal(state.employees["stress-ball"]?.reportsTo, "monitor");
  assert.equal(state.employees.pen?.reportsTo, "usb-hub");
  assert.equal(state.employees.charger?.reportsTo, "usb-hub");
  assert.equal(state.employees.coaster, undefined);
  assert.equal(state.employees["pen-2"], undefined);
  assert.equal(state.deskLeadId, "monitor");
});

test("qa default keeps all thirteen employees and biographies stay in the files", () => {
  const state = createDefaultState("qa");
  assert.equal(rosterIds(state).length, 13);
  assert.equal(state.employees.coaster?.reportsTo, "mug");
  assert.ok(state.employees["pen-2"]);
  assert.ok(state.employees["sticky-notes"]);
  assert.ok(state.employees.scissors);
  assert.ok(state.employees.stapler);
});

test("demo and qa persist to different keys and do not clobber each other", () => {
  const mem = installStorage();
  loadState("demo");
  const demo = getState();
  assert.equal(demo.seed, "demo");
  assert.equal(demo.employees.mug?.reviews[0]?.rating, 2);
  assert.equal(demo.employees.pen?.reviews[0]?.rating, 5);
  assert.equal(demo.employees.plant?.standing, "on_pip");
  assert.equal(demo.activity.every((entry) => entry.actor === "system"), true);
  assert.equal(demo.employees["pen-2"], undefined);
  assert.ok(mem.get("pip-the-mug:v2:demo"));
  assert.equal(mem.get("pip-the-mug:v2:qa"), undefined);

  loadState("qa");
  const qa = getState();
  assert.equal(qa.seed, "qa");
  assert.equal(qa.employees["pen-2"]?.reviews[0]?.rating, 3);
  assert.equal(qa.employees.mug?.reviews[0]?.rating, 2);
  assert.equal(qa.employees.plant?.standing, "on_pip");
  assert.equal(rosterIds(qa).length, 13);
  assert.ok(mem.get("pip-the-mug:v2:demo"));
  assert.ok(mem.get("pip-the-mug:v2:qa"));

  const demoSaved = JSON.parse(mem.get("pip-the-mug:v2:demo")!) as { employees: Record<string, unknown> };
  assert.equal(Object.keys(demoSaved.employees).length, 8);
  assert.equal("coaster" in demoSaved.employees, false);
});

test("reset company rewrites only the current seed", () => {
  const mem = installStorage();
  loadState("demo");
  const demoRaw = mem.get("pip-the-mug:v2:demo");
  loadState("qa");
  resetCompany("human");
  assert.equal(mem.get("pip-the-mug:v2:demo"), demoRaw);
  const qa = JSON.parse(mem.get("pip-the-mug:v2:qa")!) as { seed: string; employees: Record<string, unknown> };
  assert.equal(qa.seed, "qa");
  assert.equal(Object.keys(qa.employees).length, 13);
});

test("list_staff and org chart follow the selected roster", () => {
  const demo = createDefaultState("demo");
  const demoRows = listStaffRows(demo);
  assert.equal(demoRows.length, 8);
  assert.equal(demoRows.some((row) => row.id === "stapler"), false);
  const chart = orgChart(demo);
  assert.equal(chart.interimDeskLead.id, "monitor");
  const hub = chart.nodes.find((node) => node.id === "usb-hub");
  assert.ok(hub);
  assert.deepEqual(hub.reports.sort(), ["charger", "pen"]);
});

test("resolve_pip refuses alumni even with an open PIP still on file", () => {
  installStorage();
  loadState("demo");
  terminate("plant", "test", "human");
  const result = resolvePip("plant", "passed", "human");
  assert.equal(result.ok, false);
  assert.equal(getState().employees.plant?.standing, "terminated");
});

test("demo org chart omits QA-only reports", () => {
  const qa = createDefaultState("qa");
  const qaChart = orgChart(qa);
  const mug = qaChart.nodes.find((node) => node.id === "mug");
  assert.ok(mug);
  assert.equal(mug.reports.includes("coaster"), true);
});
