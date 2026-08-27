import { EMPLOYEE_IDS, type EmployeeId } from "../types.ts";

export const PROP_SPRITES = [
  "sink-box",
  "pip-sticker",
  "shelf-board",
  "shelf-archive",
  "shelf-label",
  "drawer-open",
  "drawer-handle",
  "sink-basin",
  "sink-tag",
] as const;

const ready = new Map<string, boolean>();

function probe(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

export function spriteHref(id: string): string {
  return `/sprites/${id}.png`;
}

export function hasSprite(id: string): boolean {
  return ready.get(id) === true;
}

export async function preloadSprites(): Promise<void> {
  const ids = [...EMPLOYEE_IDS, ...PROP_SPRITES];
  await Promise.all(
    ids.map(async (id) => {
      ready.set(id, await probe(spriteHref(id)));
    }),
  );
}

export function spriteImage(id: EmployeeId | string, x = 0, y = 0, size = 64): string {
  if (!hasSprite(id)) return "";
  return `<image class="emp-sprite" href="${spriteHref(id)}" x="${x}" y="${y}" width="${size}" height="${size}" />`;
}
