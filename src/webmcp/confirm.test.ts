import assert from "node:assert/strict";
import { test } from "node:test";
import { isUnsupportedUserInteraction, requestTerminationConfirmation } from "./confirm.ts";

function withConfirm(value: boolean, run: () => Promise<void>): Promise<void> {
  const previous = (globalThis as { window?: { confirm: (message: string) => boolean } }).window;
  (globalThis as { window: { confirm: (message: string) => boolean } }).window = {
    confirm: () => value,
  };
  return run().finally(() => {
    if (previous) (globalThis as { window: typeof previous }).window = previous;
    else delete (globalThis as { window?: unknown }).window;
  });
}

test("detects the Codex WebMCP shim error", () => {
  assert.equal(
    isUnsupportedUserInteraction(new Error("requestUserInteraction is not supported by the Codex WebMCP shim.")),
    true,
  );
  assert.equal(isUnsupportedUserInteraction(new TypeError("boom")), false);
});

test("supported interaction, approved", async () => {
  await withConfirm(true, async () => {
    let calls = 0;
    const result = await requestTerminationConfirmation(
      {
        requestUserInteraction: async (cb: () => Promise<unknown>) => {
          calls += 1;
          return cb();
        },
      },
      "ok?",
    );
    assert.equal(calls, 1);
    assert.deepEqual(result, { kind: "resolved", confirmed: true });
  });
});

test("supported interaction, rejected", async () => {
  await withConfirm(false, async () => {
    const result = await requestTerminationConfirmation(
      {
        requestUserInteraction: async (cb: () => Promise<unknown>) => cb(),
      },
      "ok?",
    );
    assert.deepEqual(result, { kind: "resolved", confirmed: false });
  });
});

test("Codex-style unsupported method becomes manual", async () => {
  const result = await requestTerminationConfirmation(
    {
      requestUserInteraction: async () => {
        throw new Error("requestUserInteraction is not supported by the Codex WebMCP shim.");
      },
    },
    "ok?",
  );
  assert.deepEqual(result, { kind: "manual" });
});

test("missing method becomes manual", async () => {
  const result = await requestTerminationConfirmation({}, "ok?");
  assert.deepEqual(result, { kind: "manual" });
});
