import { prefersReducedMotion } from "../lib/dom.ts";

const PACE_MS = 420;
const waiters: Array<() => void> = [];
let running = false;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function enqueue<T>(work: () => T | Promise<T>): Promise<T> {
  if (running) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  running = true;
  try {
    const result = await work();
    if (!prefersReducedMotion()) {
      await delay(PACE_MS);
    }
    return result;
  } finally {
    running = false;
    const next = waiters.shift();
    next?.();
  }
}
