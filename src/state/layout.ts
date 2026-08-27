import type { EmployeeId, LayoutPose, Zone } from "../types.ts";

export interface ZoneBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ZONE_BOX: Record<Zone, ZoneBox> = {
  shelf: { x: 170, y: 72, w: 910, h: 80 },
  prime: { x: 360, y: 210, w: 380, h: 110 },
  drawer: { x: 170, y: 516, w: 304, h: 140 },
  sink: { x: 888, y: 492, w: 244, h: 176 },
  standard: { x: 168, y: 160, w: 920, h: 380 },
};

/** Two short boards. Hits must not form a second alumni column. */
export const SHELF_BOXES: ZoneBox[] = [
  { x: 170, y: 72, w: 260, h: 80 },
  { x: 820, y: 72, w: 260, h: 80 },
];

const ZONE_SLOTS: Record<Zone, LayoutPose[]> = {
  prime: [
    { x: 392, y: 226, rotate: -3 },
    { x: 498, y: 230, rotate: 4 },
    { x: 604, y: 224, rotate: -2 },
  ],
  shelf: [
    { x: 848, y: 72, rotate: -6 },
    { x: 940, y: 74, rotate: 2 },
    { x: 198, y: 74, rotate: -4 },
    { x: 292, y: 76, rotate: 5 },
  ],
  drawer: [
    { x: 186, y: 540, rotate: -8 },
    { x: 322, y: 556, rotate: 10 },
    { x: 250, y: 568, rotate: 4 },
  ],
  sink: [
    { x: 958, y: 532, rotate: 16 },
    { x: 1018, y: 548, rotate: -8 },
    { x: 978, y: 568, rotate: 6 },
  ],
  standard: [
    { x: 248, y: 318, rotate: 4 },
    { x: 252, y: 372, rotate: -8 },
    { x: 538, y: 318, rotate: -7 },
    { x: 390, y: 408, rotate: 42 },
    { x: 448, y: 458, rotate: -24 },
    { x: 628, y: 428, rotate: 14 },
    { x: 778, y: 388, rotate: 28 },
    { x: 718, y: 278, rotate: 0 },
    { x: 292, y: 198, rotate: 8 },
    { x: 188, y: 250, rotate: -18 },
  ],
};

function inBox(box: ZoneBox, x: number, y: number): boolean {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

export function zoneAt(x: number, y: number): Zone {
  const order: Zone[] = ["sink", "drawer", "shelf", "prime", "standard"];
  for (const zone of order) {
    if (zone === "shelf") {
      if (SHELF_BOXES.some((box) => inBox(box, x, y))) return "shelf";
      continue;
    }
    if (inBox(ZONE_BOX[zone], x, y)) return zone;
  }
  return "standard";
}

export function slotInZone(
  zone: Zone,
  occupied: LayoutPose[],
  prefer?: LayoutPose,
): LayoutPose {
  if (prefer && zoneAt(prefer.x + 20, prefer.y + 20) === zone) {
    return prefer;
  }
  const taken = occupied.map((pose) => `${Math.round(pose.x / 24)}:${Math.round(pose.y / 24)}`);
  for (const slot of ZONE_SLOTS[zone]) {
    const key = `${Math.round(slot.x / 24)}:${Math.round(slot.y / 24)}`;
    if (!taken.includes(key)) return { ...slot };
  }
  const slots = ZONE_SLOTS[zone];
  const extra = slots[occupied.length % slots.length];
  const wave = Math.floor(occupied.length / slots.length);
  return { x: extra.x + 14 * wave, y: extra.y + 12 * wave, rotate: extra.rotate };
}

export function occupiedInZone(
  employees: Partial<Record<EmployeeId, { id: EmployeeId; zone: Zone; pose: LayoutPose }>>,
  zone: Zone,
  except: EmployeeId,
): LayoutPose[] {
  return Object.values(employees)
    .filter((emp): emp is { id: EmployeeId; zone: Zone; pose: LayoutPose } => Boolean(emp))
    .filter((emp) => emp.id !== except && emp.zone === zone)
    .map((emp) => emp.pose);
}
