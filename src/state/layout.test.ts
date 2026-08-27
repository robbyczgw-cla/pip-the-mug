import assert from "node:assert/strict";
import { test } from "node:test";
import { zoneAt } from "./layout.ts";

test("shelf hits are two short boards, not a full-width column", () => {
  assert.equal(zoneAt(200, 100), "shelf");
  assert.equal(zoneAt(900, 100), "shelf");
  assert.equal(zoneAt(520, 100), "standard");
});

test("drawer and sink stay distinct drop targets", () => {
  assert.equal(zoneAt(220, 580), "drawer");
  assert.equal(zoneAt(1010, 560), "sink");
  assert.equal(zoneAt(600, 360), "standard");
});
