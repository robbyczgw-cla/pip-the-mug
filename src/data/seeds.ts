import type { DeskSeed, EmployeeId, LayoutPose, Zone } from "../types.ts";
import { EMPLOYEE_IDS } from "../types.ts";

export const DEMO_ROSTER = [
  "monitor",
  "mug",
  "pen",
  "plant",
  "usb-hub",
  "charger",
  "webcam-cover",
  "stress-ball",
] as const satisfies readonly EmployeeId[];

export type DemoEmployeeId = (typeof DEMO_ROSTER)[number];

export const QA_ROSTER: readonly EmployeeId[] = EMPLOYEE_IDS;

export const DEMO_REPORTS: Record<DemoEmployeeId, EmployeeId | null> = {
  monitor: null,
  mug: "monitor",
  plant: "monitor",
  "usb-hub": "monitor",
  "webcam-cover": "monitor",
  "stress-ball": "monitor",
  pen: "usb-hub",
  charger: "usb-hub",
};

export const DEMO_ZONES: Record<DemoEmployeeId, Zone> = {
  monitor: "prime",
  "webcam-cover": "standard",
  mug: "standard",
  pen: "standard",
  "usb-hub": "standard",
  charger: "standard",
  plant: "standard",
  "stress-ball": "standard",
};

/** Slightly untidy start. Blotter stays open; Mug is the focal hire. */
export const DEMO_LAYOUT: Record<DemoEmployeeId, LayoutPose> = {
  monitor: { x: 508, y: 92, rotate: 0 },
  "usb-hub": { x: 198, y: 176, rotate: 4 },
  "webcam-cover": { x: 348, y: 168, rotate: 10 },
  charger: { x: 248, y: 302, rotate: -20 },
  plant: { x: 858, y: 218, rotate: -8 },
  mug: { x: 528, y: 352, rotate: 3 },
  pen: { x: 196, y: 430, rotate: 28 },
  "stress-ball": { x: 848, y: 338, rotate: 8 },
};

export function isDemoId(id: EmployeeId): id is DemoEmployeeId {
  return (DEMO_ROSTER as readonly EmployeeId[]).includes(id);
}

export function rosterFor(seed: DeskSeed): readonly EmployeeId[] {
  if (seed === "demo") return DEMO_ROSTER;
  return QA_ROSTER;
}

export function detectSeed(): DeskSeed {
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname.replace(/\/$/, "");
  if (params.get("qa") === "1" || path === "/qa") return "qa";
  return "demo";
}

export function storageKey(seed: DeskSeed): string {
  return `pip-the-mug:v2:${seed}`;
}

export const LEGACY_STORAGE_KEY = "pip-the-mug:v1";
