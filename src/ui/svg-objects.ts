import type { EmployeeId } from "../types";
import { spriteHref } from "./sprites";

/**
 * Each employee draws into a 64x64 local box centred on (32, 32), which is the
 * rotation origin the desk layout assumes. A pixel-art PNG sits on top; the
 * hand-built vector version underneath is revealed only if the PNG is missing.
 *
 * `size` is how many desk units the object occupies. It scales both the sprite
 * and the fallback, so a monitor still dwarfs a webcam cover.
 */

interface SrcBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ObjectArt {
  /** Footprint in desk units, centred on (32, 32). */
  size: number;
  caption: string;
  /** Bounding box of the legacy vector art, used to fit it into `size`. */
  src: SrcBox;
  fallback: string;
}

const OBJECTS: Record<EmployeeId, ObjectArt> = {
  mug: {
    size: 96,
    caption: "Mug",
    src: { x: 6, y: 2, w: 56, h: 62 },
    fallback: `
      <ellipse cx="28" cy="58" rx="22" ry="6" fill="#241c14" opacity="0.16"/>
      <path d="M10 16c1.2-9 8-13 18-13s16.8 4 18 13v28c0 8.5-8 13-18 13s-18-4.5-18-13z" fill="#f3eee6" stroke="#241c14" stroke-width="1.7"/>
      <path d="M12 22c2 18 8 28 16 28s14-10 16-28" fill="none" stroke="#241c14" stroke-width="0.6" opacity="0.18"/>
      <ellipse cx="28" cy="16" rx="15.5" ry="5.4" fill="#3d2412"/>
      <ellipse cx="28" cy="15.2" rx="12" ry="3.4" fill="#5a3820" opacity="0.7"/>
      <path d="M18 15c4 2.4 12 2.6 20 0.2" fill="none" stroke="#c4a882" stroke-width="1.1" opacity="0.7"/>
      <path d="M46 20c11 3 13 11 12 18-1 8-7 13-14 14" fill="none" stroke="#241c14" stroke-width="2.3" stroke-linecap="round"/>
    `,
  },

  coaster: {
    size: 76,
    caption: "Coaster",
    src: { x: 2, y: 4, w: 52, h: 32 },
    fallback: `
      <ellipse cx="28" cy="22" rx="26" ry="16" fill="#241c14" opacity="0.1"/>
      <ellipse cx="28" cy="20" rx="26" ry="16" fill="#d7c4a3" stroke="#241c14" stroke-width="1.5"/>
      <ellipse cx="28" cy="20" rx="18" ry="10" fill="none" stroke="#8b5e34" stroke-width="1.1" opacity="0.55"/>
      <ellipse cx="28" cy="20" rx="8" ry="4.5" fill="none" stroke="#8b5e34" stroke-width="0.8" opacity="0.4"/>
    `,
  },

  pen: {
    size: 130,
    caption: "Pen",
    src: { x: 2, y: 8, w: 104, h: 20 },
    fallback: `
      <ellipse cx="54" cy="18" rx="48" ry="5" fill="#241c14" opacity="0.12"/>
      <path d="M8 10h78c3 0 6 2.2 8 4.5L102 18l-8 3.5C92 24 89 26 86 26H8c-2.2 0-4-2-4-4.5v-7C4 12 5.8 10 8 10z" fill="#1e3a4c" stroke="#241c14" stroke-width="1.4"/>
      <rect x="18" y="10" width="10" height="16" fill="#c45c26"/>
      <path d="M86 10.5l12 7.5-12 7.5" fill="#d8d3c8" stroke="#241c14" stroke-width="1.2"/>
      <path d="M98 18l6 1.2-1.6 2.2z" fill="#241c14"/>
      <circle cx="14" cy="18" r="2.1" fill="#f6f0e4"/>
    `,
  },

  "pen-2": {
    size: 124,
    caption: "Pen (2)",
    src: { x: 4, y: 9, w: 94, h: 18 },
    fallback: `
      <ellipse cx="48" cy="18" rx="44" ry="5" fill="#241c14" opacity="0.1"/>
      <path d="M10 11h70c2 0 4 1.6 4 4.2v5.6c0 2.6-2 4.2-4 4.2H10c-2.4 0-4.2-2-4.2-4.5v-5c0-2.5 1.8-4.5 4.2-4.5z" fill="#6b5e4e" stroke="#241c14" stroke-width="1.4"/>
      <rect x="70" y="11" width="18" height="14" fill="#c4a574" stroke="#241c14" stroke-width="1.1"/>
      <rect x="86" y="14" width="10" height="8" rx="1" fill="#3d2412"/>
    `,
  },

  monitor: {
    size: 150,
    caption: "Monitor",
    src: { x: 6, y: 6, w: 234, h: 138 },
    fallback: `
      <rect x="18" y="132" width="210" height="10" rx="2" fill="#241c14" opacity="0.14"/>
      <rect x="8" y="8" width="230" height="118" rx="8" fill="#2a3338" stroke="#241c14" stroke-width="2"/>
      <rect x="18" y="18" width="210" height="90" fill="#8fa6a0"/>
      <rect x="18" y="18" width="210" height="90" fill="#c5d4c8" opacity="0.35"/>
      <text x="123" y="58" text-anchor="middle" font-size="9" fill="#1e3a4c" font-family="ui-sans-serif, system-ui, sans-serif" letter-spacing="1.4">MARCH 2025</text>
      <rect x="34" y="68" width="22" height="18" fill="#f6f0e4" opacity="0.85"/>
      <rect x="60" y="68" width="22" height="18" fill="#f6f0e4" opacity="0.55"/>
      <rect x="86" y="68" width="22" height="18" fill="#e8c547" opacity="0.7"/>
      <circle cx="28" cy="22" r="2.4" fill="#3d6b4f"/>
      <rect x="108" y="108" width="20" height="18" fill="#2a3338" stroke="#241c14" stroke-width="1.3"/>
      <rect x="78" y="126" width="80" height="8" rx="1" fill="#3a444a" stroke="#241c14" stroke-width="1.2"/>
      <circle cx="42" cy="36" r="3.2" fill="#4a5c62" opacity="0.9"/>
    `,
  },

  plant: {
    size: 120,
    caption: "Plant",
    src: { x: 12, y: 18, w: 52, h: 78 },
    fallback: `
      <ellipse cx="36" cy="88" rx="22" ry="6" fill="#241c14" opacity="0.14"/>
      <path d="M16 70h40l-5 18H21z" fill="#c45c26" stroke="#241c14" stroke-width="1.5"/>
      <ellipse cx="36" cy="70" rx="21" ry="6" fill="#a34b20" stroke="#241c14" stroke-width="1.2"/>
      <path d="M36 68c-2-18 8-38 8-38" fill="none" stroke="#3d6b4f" stroke-width="1.6"/>
      <path d="M36 62c-14-10-22-6-24 2 8 2 18 4 24 2z" fill="#6b8f62" stroke="#241c14" stroke-width="1.2"/>
      <path d="M36 58c12-16 24-12 26-4-10 2-20 6-26 4z" fill="#4f7348" stroke="#241c14" stroke-width="1.2"/>
      <path d="M38 50c4-18 18-22 22-14-8 4-16 12-22 14z" fill="#7fa072" stroke="#241c14" stroke-width="1.1"/>
      <path d="M22 48c-8-4-10 4-6 8 6-1 10-4 6-8z" fill="#c4b48a" stroke="#241c14" stroke-width="0.9" opacity="0.9"/>
    `,
  },

  charger: {
    size: 110,
    caption: "Charger",
    src: { x: 6, y: 15, w: 84, h: 34 },
    fallback: `
      <ellipse cx="40" cy="58" rx="30" ry="7" fill="#241c14" opacity="0.1"/>
      <rect x="8" y="18" width="28" height="18" rx="3" fill="#1e3a4c" stroke="#241c14" stroke-width="1.4"/>
      <rect x="14" y="22" width="8" height="6" fill="#f6f0e4" opacity="0.7"/>
      <path d="M36 27c18-14 38-2 48 10 6 8-4 16-14 10-8-4-10-16-20-18" fill="none" stroke="#241c14" stroke-width="2.2" stroke-linecap="round"/>
      <rect x="68" y="36" width="16" height="10" rx="2" fill="#2a3338" stroke="#241c14" stroke-width="1.3"/>
    `,
  },

  "sticky-notes": {
    size: 96,
    caption: "Notes",
    src: { x: 8, y: 8, w: 54, h: 54 },
    fallback: `
      <rect x="16" y="16" width="44" height="44" fill="#e8c547" stroke="#241c14" stroke-width="1.3" transform="rotate(-8 38 38)"/>
      <rect x="12" y="12" width="44" height="44" fill="#f0d35c" stroke="#241c14" stroke-width="1.4" transform="rotate(4 34 34)"/>
      <path d="M18 24h28M18 32h22M18 40h18" fill="none" stroke="#241c14" stroke-width="1" opacity="0.45"/>
    `,
  },

  scissors: {
    size: 120,
    caption: "Scissors",
    src: { x: 4, y: 4, w: 76, h: 44 },
    fallback: `
      <ellipse cx="40" cy="40" rx="28" ry="6" fill="#241c14" opacity="0.1"/>
      <circle cx="16" cy="16" r="10" fill="none" stroke="#241c14" stroke-width="2.2"/>
      <circle cx="16" cy="36" r="10" fill="none" stroke="#241c14" stroke-width="2.2"/>
      <path d="M24 22l52 6" stroke="#8a9096" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M24 30l52-8" stroke="#b8bec4" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="28" cy="26" r="2.4" fill="#241c14"/>
    `,
  },

  stapler: {
    size: 118,
    caption: "Stapler",
    src: { x: 6, y: 6, w: 72, h: 36 },
    fallback: `
      <ellipse cx="40" cy="38" rx="32" ry="6" fill="#241c14" opacity="0.12"/>
      <rect x="8" y="22" width="64" height="12" rx="2" fill="#7a3b2e" stroke="#241c14" stroke-width="1.4"/>
      <path d="M12 22h50c2 0 4-2 4-5V12c0-2-2-4-4.5-4H28c-6 0-10 4-14 8l-4 6z" fill="#9a4a3a" stroke="#241c14" stroke-width="1.4"/>
      <rect x="14" y="14" width="18" height="6" fill="#241c14" opacity="0.25"/>
      <rect x="8" y="32" width="68" height="6" rx="1" fill="#5e2e24" stroke="#241c14" stroke-width="1.2"/>
    `,
  },

  "webcam-cover": {
    size: 70,
    caption: "Cover",
    src: { x: 2, y: 6, w: 48, h: 20 },
    fallback: `
      <rect x="4" y="8" width="44" height="16" rx="8" fill="#2a3338" stroke="#241c14" stroke-width="1.4"/>
      <rect x="6" y="10" width="20" height="12" rx="6" fill="#c45c26" stroke="#241c14" stroke-width="1"/>
    `,
  },

  "usb-hub": {
    size: 110,
    caption: "USB Hub",
    src: { x: 4, y: 6, w: 80, h: 34 },
    fallback: `
      <ellipse cx="44" cy="36" rx="36" ry="6" fill="#241c14" opacity="0.12"/>
      <rect x="6" y="8" width="76" height="24" rx="6" fill="#d8d3c8" stroke="#241c14" stroke-width="1.5"/>
      <rect x="16" y="14" width="10" height="8" rx="1" fill="#241c14"/>
      <rect x="32" y="14" width="10" height="8" rx="1" fill="#241c14"/>
      <rect x="48" y="14" width="10" height="8" rx="1" fill="#3d6b4f"/>
      <rect x="64" y="14" width="10" height="8" rx="1" fill="#241c14" opacity="0.45"/>
      <circle cx="12" cy="20" r="2" fill="#3d6b4f"/>
    `,
  },

  "stress-ball": {
    size: 88,
    caption: "Stress Ball",
    src: { x: 6, y: 4, w: 50, h: 52 },
    fallback: `
      <ellipse cx="30" cy="48" rx="20" ry="6" fill="#241c14" opacity="0.12"/>
      <circle cx="30" cy="28" r="22" fill="#c45c26" stroke="#241c14" stroke-width="1.6"/>
      <path d="M18 22c6-8 18-8 24-2" fill="none" stroke="#f3eee6" stroke-width="1.4" opacity="0.5"/>
      <circle cx="22" cy="24" r="3" fill="#f3eee6" opacity="0.35"/>
    `,
  },
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Fits the legacy vector art into a `size` box centred on the given point. */
function fallbackGroup(object: ObjectArt, size: number, cx: number, cy: number): string {
  const { src } = object;
  const scale = size / Math.max(src.w, src.h);
  const tx = round(cx - scale * (src.x + src.w / 2));
  const ty = round(cy - scale * (src.y + src.h / 2));
  return `<g class="emp-fallback" transform="translate(${tx} ${ty}) scale(${round(scale)})">${object.fallback}</g>`;
}

/**
 * Sprite layered over its vector fallback. The sprite is always emitted; if the
 * PNG is missing, its onerror hands the group back to the vector art.
 */
function art(id: EmployeeId, object: ObjectArt, size: number, cx: number, cy: number): string {
  const x = round(cx - size / 2);
  const y = round(cy - size / 2);
  return `
    <g class="emp-art">
      <image
        class="emp-sprite"
        href="${spriteHref(id)}"
        x="${x}" y="${y}" width="${size}" height="${size}"
        preserveAspectRatio="xMidYMid meet"
        onerror="this.parentNode.classList.add('no-sprite')"
      />
      ${fallbackGroup(object, size, cx, cy)}
    </g>
  `;
}

/** Click target: the footprint, inset so neighbouring objects stay reachable. */
function hitRect(size: number): string {
  const side = round(size * 0.8);
  const offset = round(32 - side / 2);
  return `<rect class="emp-hit" x="${offset}" y="${offset}" width="${side}" height="${side}" rx="8"/>`;
}

export function renderObjectSvg(id: EmployeeId, _selected = false): string {
  const object = OBJECTS[id];
  return `
    ${hitRect(object.size)}
    ${art(id, object, object.size, 32, 32)}
    <text class="emp-caption" x="32" y="${round(32 + object.size / 2 + 13)}">${object.caption}</text>
  `;
}

/** Square portrait for the personnel file, drawn in a 0 0 64 64 viewBox. */
export function renderIdentitySvg(id: EmployeeId): string {
  const object = OBJECTS[id];
  return art(id, object, 58, 32, 32);
}
