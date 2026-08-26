import {
  createDefaultState,
  getState,
  putOnPip,
  replaceState,
  writeReview,
} from "../state/store";
import type { CompanyState } from "../types";

export function isDemoRequest(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1") return true;
  const path = window.location.pathname.replace(/\/$/, "");
  return path === "/demo";
}

export function applyDemoSeed(): CompanyState {
  replaceState(createDefaultState(), true);
  writeReview(
    "pen",
    {
      rating: 5,
      summary:
        "Pen continues to produce nearly all written output on Desk 4B. Colleagues still borrow without tickets. Cartridge request remains open.",
      strengths: ["Volume", "Reliability", "The only signed expense report"],
      concerns: ["Barrel wear", "No backup because Second Pen will not uncap"],
    },
    "human",
  );
  writeReview(
    "mug",
    {
      rating: 2,
      summary:
        "Retention of the current serving is now a three-week event. Emptying was discussed. Emptying did not occur.",
      strengths: ["Has not spilled", "Perfect attendance"],
      concerns: ["Contents", "Film", "Initiative"],
    },
    "human",
  );
  writeReview(
    "pen-2",
    {
      rating: 3,
      summary: "Still capped. Still aligning on a writing strategy. Still here.",
      strengths: ["Has not dried out"],
      concerns: ["Output is one faint line from a pocket"],
    },
    "human",
  );
  putOnPip(
    "plant",
    {
      reason: "Morale contribution is visual and declining. Two leaves remain.",
      goals: [
        "Receive water without a shared-responsibility ticket",
        "Produce a new leaf",
        "Stop submitting green-adjacent standups",
      ],
      days: 60,
    },
    "human",
  );
  return getState();
}
