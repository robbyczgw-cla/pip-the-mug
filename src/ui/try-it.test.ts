import assert from "node:assert/strict";
import { test } from "node:test";
import { Window } from "happy-dom";
import { copyDemoPrompt, DEMO_PROMPT, renderTryIt } from "./try-it.ts";

test("demo prompt is a one-minute WebMCP protocol, not DOM automation", () => {
  assert.match(DEMO_PROMPT, /WebMCP tools this page registered/);
  assert.match(DEMO_PROMPT, /Do not click DOM controls/);
  assert.match(DEMO_PROMPT, /Form SEP-1/);
  assert.match(DEMO_PROMPT, /I will not click it/);
  assert.match(DEMO_PROMPT, /monitor, mug, pen, plant, usb-hub, charger, webcam-cover, stress-ball/);
});

test("try-it guide is collapsed by default and expands in place", () => {
  const shut = renderTryIt(false);
  assert.match(shut, /Try it with your agent · about 1 minute/);
  assert.match(shut, /aria-expanded="false"/);
  assert.equal(shut.includes("Copy prompt"), false);
  assert.equal(shut.includes("Reset company"), false);

  const open = renderTryIt(true);
  assert.match(open, /aria-expanded="true"/);
  assert.match(open, /named WebMCP tools/);
  assert.match(open, /Form SEP-1/);
  assert.match(open, /ChatGPT/);
  assert.match(open, /Chrome 149/);
  assert.match(open, /data-action="copy-demo-prompt"/);
  assert.match(open, /data-action="reset-company"/);
  assert.match(open, /must not click that control/);
});

test("copyDemoPrompt writes the demo prompt to the clipboard", async () => {
  const happy = new Window({ url: "http://127.0.0.1:4173/" });
  const g = globalThis as typeof globalThis & { window: Window; document: Document; navigator: Navigator };
  g.window = happy;
  g.document = happy.document as unknown as Document;
  let copied = "";
  Object.defineProperty(g, "navigator", {
    configurable: true,
    value: {
      clipboard: {
        writeText: async (text: string) => {
          copied = text;
        },
      },
    },
  });
  assert.equal(await copyDemoPrompt(), true);
  assert.equal(copied, DEMO_PROMPT);
});
