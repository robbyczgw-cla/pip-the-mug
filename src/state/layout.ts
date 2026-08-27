import type { EmployeeId, LayoutPose, Zone } from "../types";

export const ZONE_BOX: Record<Zone, { x: number; y: number; w: number; h: number }> = {
  shelf: { x: 188, y: 80, w: 944, h: 72 },
  prime: { x: 360, y: 210, w: 380, h: 110 },
  drawer: { x: 188, y: 548, w: 220, h: 108 },
  sink: { x: 900, y: 512, w: 228, h: 140 },
  standard: { x: 168, y: 160, w: 920, h: 380 },
};

const ZONE_SLOTS: Record<Zone, LayoutPose[]> = {
  prime: [
    { x: 400, y: 228, rotate: -3 },
    { x: 500, y: 232, rotate: 4 },
    { x: 600, y: 226, rotate: -2 },
  ],
  shelf: [
    { x: 210, y: 88, rotate: -4 },
    { x: 310, y: 90, rotate: 5 },
    { x: 760, y: 88, rotate: 2 },
    { x: 868, y: 86, rotate: -6 },
  ],
  drawer: [
    { x: 198, y: 568, rotate: -12 },
    { x: 268, y: 574, rotate: 22 },
    { x: 330, y: 566, rotate: 8 },
  ],
  sink: [
    { x: 924, y: 538, rotate: 10 },
    { x: 1000, y: 540, rotate: -8 },
    { x: 962, y: 572, rotate: 6 },
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

export function zoneAt(x: number, y: number): Zone {
  const order: Zone[] = ["sink", "drawer", "shelf", "prime", "standard"];
  for (const zone of order) {
    const box = ZONE_BOX[zone];
    if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
      return zone;
    }
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
  employees: Record<EmployeeId, { id: EmployeeId; zone: Zone; pose: LayoutPose }>,
  zone: Zone,
  except: EmployeeId,
): LayoutPose[] {
  return Object.values(employees)
    .filter((emp) => emp.id !== except && emp.zone === zone)
    .map((emp) => emp.pose);
}
