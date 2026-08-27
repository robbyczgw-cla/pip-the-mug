import assert from "node:assert/strict";
import { test } from "node:test";
import { EMPLOYEE_IDS } from "../types.ts";
import { DEMO_ROSTER, QA_ROSTER, rosterFor, storageKey } from "./seeds.ts";

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

test("seed storage keys stay separate", () => {
  assert.equal(storageKey("demo"), "pip-the-mug:v2:demo");
  assert.equal(storageKey("qa"), "pip-the-mug:v2:qa");
  assert.equal(storageKey("open"), "pip-the-mug:v2:open");
  assert.notEqual(storageKey("demo"), storageKey("qa"));
  assert.notEqual(storageKey("demo"), storageKey("open"));
});
