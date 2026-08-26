import { DEFAULT_LAYOUT, RENDER_ORDER, STAFF_BY_ID } from "../data/staff";
import { escapeHtml } from "../lib/dom";
import type { EmployeeId } from "../types";
import { renderObjectSvg } from "./svg-objects";

export function renderDeskSvg(selectedId: EmployeeId | null): string {
  const objects = RENDER_ORDER.map((id) => {
    const pose = DEFAULT_LAYOUT[id];
    const record = STAFF_BY_ID[id];
    const selected = selectedId === id;
    const label = `${record.name}, ${record.role}`;
    return `
      <g
        class="emp ${selected ? "is-selected" : ""}"
        data-id="${id}"
        tabindex="0"
        role="button"
        aria-label="${escapeHtml(label)}"
        aria-pressed="${selected ? "true" : "false"}"
        transform="translate(${pose.x} ${pose.y}) rotate(${pose.rotate})"
      >
        ${renderObjectSvg(id, selected)}
      </g>
    `;
  }).join("");

  return `
    <svg
      class="desk-svg"
      viewBox="0 0 1200 760"
      role="img"
      aria-label="Top-down view of Desk 4B. Thirteen employees sit on the desk. Click an object to open its personnel file."
    >
      <defs>
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.07"/>
          </feComponentTransfer>
        </filter>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#241c14" flood-opacity="0.18"/>
        </filter>
        <pattern id="wood" width="42" height="42" patternUnits="userSpaceOnUse">
          <rect width="42" height="42" fill="#c4965c"/>
          <path d="M0 8c10 2 16-4 42 0" fill="none" stroke="#b07e45" stroke-width="3" opacity="0.45"/>
          <path d="M0 24c14 4 20-2 42 2" fill="none" stroke="#a06e3c" stroke-width="2" opacity="0.35"/>
          <path d="M0 36c12-3 22 3 42-1" fill="none" stroke="#d4b07a" stroke-width="1.5" opacity="0.25"/>
        </pattern>
        <pattern id="cork" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#c4a574"/>
          <circle cx="3" cy="5" r="0.8" fill="#8b5e34" opacity="0.35"/>
          <circle cx="11" cy="10" r="0.7" fill="#8b5e34" opacity="0.3"/>
          <circle cx="8" cy="2" r="0.5" fill="#6b4423" opacity="0.25"/>
        </pattern>
      </defs>

      <rect class="wall" x="0" y="0" width="1200" height="760" fill="#efe6d4"/>
      <rect x="0" y="0" width="1200" height="760" filter="url(#grain)"/>

      <!-- Alumni cork wall -->
      <g class="alumni-board">
        <rect x="18" y="78" width="122" height="580" rx="6" fill="url(#cork)" stroke="#8b5e34" stroke-width="3"/>
        <rect x="28" y="92" width="102" height="28" fill="#f6f0e4" stroke="#241c14" stroke-width="1.2"/>
        <text x="79" y="111" text-anchor="middle" class="zone-label">ALUMNI</text>
        <text x="79" y="160" text-anchor="middle" class="zone-hint">No separations
this quarter.</text>
      </g>

      <!-- Desk -->
      <g filter="url(#soft-shadow)">
        <rect x="156" y="64" width="1008" height="632" rx="18" fill="#8b5e34"/>
        <rect x="168" y="76" width="984" height="596" rx="12" fill="url(#wood)"/>
        <rect x="168" y="76" width="984" height="596" rx="12" filter="url(#grain)"/>
      </g>

      <!-- Blotter -->
      <rect x="380" y="300" width="420" height="260" rx="4" fill="#d9c7a1" opacity="0.55" stroke="#8b5e34" stroke-width="1"/>
      <rect x="392" y="312" width="396" height="236" fill="none" stroke="#b08a54" stroke-width="0.6" opacity="0.5"/>

      <!-- Coffee ring: Coaster is unused -->
      <ellipse cx="310" cy="360" rx="26" ry="16" fill="none" stroke="#8b5e34" stroke-width="3" opacity="0.28"/>
      <ellipse cx="310" cy="360" rx="18" ry="10" fill="none" stroke="#8b5e34" stroke-width="1.5" opacity="0.2"/>

      <!-- Shelf zone -->
      <rect x="188" y="88" width="944" height="52" rx="4" fill="#241c14" opacity="0.06"/>
      <text x="210" y="118" class="zone-chip">SHELF</text>

      <!-- Prime zone near monitor -->
      <text x="430" y="268" class="zone-chip">PRIME</text>

      <!-- Drawer -->
      <g class="drawer-zone">
        <rect x="188" y="560" width="220" height="88" rx="6" fill="#a06e3c" stroke="#6b4423" stroke-width="2"/>
        <rect x="198" y="570" width="200" height="68" rx="3" fill="#b8874f"/>
        <circle cx="298" cy="604" r="6" fill="#d8d3c8" stroke="#241c14" stroke-width="1.2"/>
        <text x="298" y="548" text-anchor="middle" class="zone-chip">DRAWER</text>
      </g>

      <!-- Donated / Sink -->
      <g class="sink-zone">
        <rect x="900" y="520" width="220" height="128" rx="8" fill="#c5ccc8" stroke="#241c14" stroke-width="2"/>
        <rect x="912" y="532" width="196" height="78" rx="40" fill="#9aa3a0" stroke="#241c14" stroke-width="1.4"/>
        <ellipse cx="1010" cy="571" rx="18" ry="10" fill="#6d7673"/>
        <rect x="912" y="616" width="196" height="22" fill="#e8d5a8" stroke="#241c14" stroke-width="1"/>
        <text x="1010" y="632" text-anchor="middle" class="zone-label">DONATED / SINK</text>
      </g>

      <!-- Nameplate -->
      <g>
        <rect x="188" y="140" width="148" height="36" rx="2" fill="#f6f0e4" stroke="#241c14" stroke-width="1.3"/>
        <text x="262" y="156" text-anchor="middle" class="nameplate">DESK 4B</text>
        <text x="262" y="170" text-anchor="middle" class="nameplate-sub">INTERIM LEAD: MONITOR</text>
      </g>

      ${objects}
    </svg>
  `;
}
