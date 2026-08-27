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
  "webcam-cover": "prime",
  mug: "standard",
  pen: "standard",
  "usb-hub": "standard",
  charger: "standard",
  plant: "shelf",
  "stress-ball": "standard",
};

/** Contemporary eight-person desk. Mug sits on the blotter as the focal hire. */
export const DEMO_LAYOUT: Record<DemoEmployeeId, LayoutPose> = {
  monitor: { x: 488, y: 96, rotate: 0 },
  "webcam-cover": { x: 590, y: 88, rotate: 2 },
  plant: { x: 900, y: 140, rotate: -8 },
  "usb-hub": { x: 250, y: 220, rotate: 6 },
  charger: { x: 190, y: 280, rotate: -16 },
  mug: { x: 520, y: 350, rotate: 2 },
  pen: { x: 368, y: 418, rotate: 28 },
  "stress-ball": { x: 792, y: 318, rotate: 10 },
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
