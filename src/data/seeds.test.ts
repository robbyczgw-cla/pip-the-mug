import assert from "node:assert/strict";
import { test } from "node:test";
import { Window } from "happy-dom";
import { EMPLOYEE_IDS } from "../types.ts";
import { DEMO_ROSTER, QA_ROSTER, detectSeed, rosterFor, storageKey } from "./seeds.ts";

test("demo roster is the eight contemporary objects", () => {
  assert.deepEqual([...DEMO_ROSTER], [
    "monitor",
    "mug",
    "pen",
    "plant",
    "usb-hub",
    "charger",
    "webcam-cover",
    "stress-ball",
  ]);
  for (const id of ["coaster", "pen-2", "sticky-notes", "scissors", "stapler"] as const) {
    assert.equal((DEMO_ROSTER as readonly string[]).includes(id), false);
  }
});

test("qa roster keeps the complete 13-person dataset", () => {
  assert.deepEqual([...QA_ROSTER], [...EMPLOYEE_IDS]);
});

test("rosterFor selects by seed", () => {
  assert.equal(rosterFor("demo").length, 8);
  assert.equal(rosterFor("qa").length, 13);
  assert.equal(rosterFor("open").length, 13);
});

test("public URLs share the demo seed", () => {
  const urls = ["http://127.0.0.1:4173/", "http://127.0.0.1:4173/demo", "http://127.0.0.1:4173/?demo=1"];
  for (const url of urls) {
    const happy = new Window({ url });
    const g = globalThis as typeof globalThis & { window: Window };
    g.window = happy;
    assert.equal(detectSeed(), "demo", url);
  }
});

test("seed storage keys stay separate", () => {
  assert.equal(storageKey("demo"), "pip-the-mug:v2:demo");
  assert.equal(storageKey("qa"), "pip-the-mug:v2:qa");
  assert.equal(storageKey("open"), "pip-the-mug:v2:open");
  assert.notEqual(storageKey("demo"), storageKey("qa"));
  assert.notEqual(storageKey("demo"), storageKey("open"));
});
