import assert from "node:assert/strict";
import { test } from "node:test";
import { closeQuarter, loadState } from "../state/store.ts";
import { registrationSignature } from "./signature.ts";
import { buildTools } from "./tools.ts";

function installStorage(): void {
  const mem = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => mem.get(key) ?? null,
      setItem: (key: string, value: string) => mem.set(key, value),
      removeItem: (key: string) => mem.delete(key),
    },
  });
}

test("registration follows metadata changes and marks user-authored read results untrusted", () => {
  installStorage();
  loadState("demo");

  const initialTools = buildTools();
  const initialSignature = registrationSignature(initialTools);
  const initialReview = initialTools.find((tool) => tool.name === "write_review");
  assert.match(initialReview?.description ?? "", /Q3 performance review/);

  for (const name of ["list_staff", "get_personnel_file", "get_org_chart"]) {
    const tool = initialTools.find((item) => item.name === name);
    assert.deepEqual(tool?.annotations, { readOnlyHint: true, untrustedContentHint: true });
  }

  closeQuarter("human");
  const currentTools = buildTools();
  const currentReview = currentTools.find((tool) => tool.name === "write_review");

  assert.match(currentReview?.description ?? "", /Q4 performance review/);
  assert.notEqual(registrationSignature(currentTools), initialSignature);
});
