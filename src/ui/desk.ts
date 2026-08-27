import { RENDER_ORDER, STAFF_BY_ID } from "../data/staff.ts";
import { escapeHtml } from "../lib/dom.ts";
import type { CompanyState, EmployeeId, LayoutPose, Zone } from "../types.ts";
import { SHELF_BOXES, ZONE_BOX } from "../state/layout.ts";
import { hasSprite, spriteHref } from "./sprites.ts";
import { renderObjectSvg } from "./svg-objects.ts";

export interface DeskFlash {
  id: EmployeeId | null;
  zone: Zone | null;
}

function alumniCards(state: CompanyState): string {
  if (state.alumni.length === 0) {
    return `<text x="79" y="148" text-anchor="middle" class="zone-hint">No separations</text>
        <text x="79" y="164" text-anchor="middle" class="zone-hint">this quarter.</text>`;
  }
  const extra = state.alumni.length > 6 ? state.alumni.length - 6 : 0;
  const cards = state.alumni
    .slice(0, 6)
    .map((row, index) => {
      const record = STAFF_BY_ID[row.employeeId];
      const y = 138 + index * 72;
      return `
        <g>
          <rect class="alumni-card" x="30" y="${y}" width="98" height="64" rx="2"/>
          <text x="79" y="${y + 22}" text-anchor="middle" class="zone-label">${escapeHtml(record.name)}</text>
          <text x="79" y="${y + 40}" text-anchor="middle" class="zone-hint">separated</text>
        </g>
      `;
    })
    .join("");
  const more =
    extra > 0
      ? `<text x="79" y="${138 + 6 * 72}" text-anchor="middle" class="zone-hint">+${extra} more</text>`
      : "";
  return cards + more;
}

function paperStack(state: CompanyState, selectedId: EmployeeId | null): string {
  const colors = { review: "#f6f0e4", pip: "#e8c547", termination: "#edc4b8" };
  const labels = { review: "PR-12", pip: "PIP-90", termination: "SEP-1" };
  const [newest, ...older] = state.papers;
  if (!newest) return "";
  const related = selectedId
    ? state.papers.filter((item) => item.employeeId === selectedId && item.id !== newest.id)
    : [];
  const shown = newest;
  const name = STAFF_BY_ID[shown.employeeId].name;
  const active = `
    <g class="desk-paper is-newest" data-id="${shown.employeeId}" tabindex="0" role="button"
       aria-label="${labels[shown.kind]} for ${escapeHtml(name)}"
       transform="translate(648 318) rotate(-4)">
      <rect width="68" height="86" fill="${colors[shown.kind]}" stroke="#241c14" stroke-width="1.3"/>
      <text x="34" y="22" text-anchor="middle" class="zone-label">${labels[shown.kind]}</text>
      <text x="34" y="40" text-anchor="middle" class="zone-hint">${escapeHtml(name)}</text>
    </g>`;
  const filed = older.length;
  if (filed === 0 && related.length === 0) return active;
  const extras = related.slice(0, 2).map((item, index) => {
    const extraName = STAFF_BY_ID[item.employeeId].name;
    return `
      <g class="desk-paper is-related" data-id="${item.employeeId}" tabindex="0" role="button"
         aria-label="${labels[item.kind]} for ${escapeHtml(extraName)}"
         transform="translate(${700 + index * 10} ${410 + index * 6}) rotate(${6 - index})">
        <rect width="48" height="62" fill="${colors[item.kind]}" stroke="#241c14" stroke-width="1"/>
        <text x="24" y="18" text-anchor="middle" class="zone-hint">${labels[item.kind]}</text>
      </g>`;
  });
  const stack = older.slice(0, 3).map((_, i) =>
    `<rect x="${814 + i}" y="${476 + i * 2}" width="50" height="64" fill="#f6f0e4" stroke="#241c14" stroke-width="1"/>`,
  ).join("");
  const tray = `
    <g class="paper-tray">
      <rect x="806" y="466" width="72" height="88" rx="4" fill="#d9c7a1" stroke="#8b5e34" stroke-width="1.4"/>
      ${stack}
      <text x="842" y="548" text-anchor="middle" class="zone-hint">${filed} filed</text>
    </g>`;
  return active + extras.join("") + (filed > 0 ? tray : "");
}

function propImage(id: string, x: number, y: number, w: number, h: number): string {
  if (!hasSprite(id)) return "";
  return `<image class="emp-sprite zone-prop" href="${spriteHref(id)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" />`;
}

function tapeLabel(x: number, y: number, w: number, h: number, text: string): string {
  return `<g class="zone-tag">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f6f0e4" stroke="#241c14" stroke-width="2"/>
      <text x="${x + w / 2}" y="${y + h / 2 + 3.5}" text-anchor="middle" class="zone-chip is-on-tag">${text}</text>
    </g>`;
}

function shelfFurniture(): string {
  const leftBoard = hasSprite("shelf-board")
    ? propImage("shelf-board", 178, 90, 238, 52)
    : `<rect x="178" y="104" width="238" height="14" fill="#a06e3c" stroke="#241c14" stroke-width="2"/>
       <rect x="180" y="90" width="234" height="16" fill="#c4965c" stroke="#241c14" stroke-width="2"/>`;
  const rightBoard = hasSprite("shelf-board")
    ? propImage("shelf-board", 832, 90, 238, 52)
    : `<rect x="832" y="104" width="238" height="14" fill="#a06e3c" stroke="#241c14" stroke-width="2"/>
       <rect x="834" y="90" width="234" height="16" fill="#c4965c" stroke="#241c14" stroke-width="2"/>`;
  const archive = hasSprite("shelf-archive")
    ? propImage("shelf-archive", 196, 52, 46, 48)
    : `<rect x="204" y="62" width="32" height="36" fill="#b8874f" stroke="#241c14" stroke-width="2"/>
       <rect x="210" y="56" width="20" height="10" fill="#f6f0e4" stroke="#241c14" stroke-width="2"/>`;
  return `
    <g class="shelf-zone" pointer-events="none">
      ${leftBoard}
      ${archive}
      ${rightBoard}
      ${tapeLabel(214, 128, 74, 16, "SHELF")}
    </g>`;
}

function drawerFurniture(): string {
  const body = hasSprite("drawer-open")
    ? propImage("drawer-open", 176, 528, 288, 123)
    : `<rect x="176" y="548" width="288" height="88" fill="#6b4423" stroke="#241c14" stroke-width="2"/>
       <rect x="186" y="556" width="268" height="62" fill="#3d2a18"/>
       <rect x="176" y="618" width="288" height="22" fill="#a06e3c" stroke="#241c14" stroke-width="2"/>`;
  const handle = hasSprite("drawer-handle")
    ? propImage("drawer-handle", 266, 632, 108, 26)
    : `<rect x="270" y="638" width="100" height="10" fill="#c4a047" stroke="#241c14" stroke-width="2"/>`;
  const holder = `<rect x="198" y="638" width="40" height="16" fill="#e8dcc4" stroke="#241c14" stroke-width="2"/>`;
  return `
    <g class="drawer-zone" pointer-events="none">
      ${body}
      ${handle}
      ${holder}
      ${tapeLabel(268, 512, 82, 16, "DRAWER")}
    </g>`;
}

function sinkFurniture(klonk: boolean, ripple: boolean): string {
  const basin = hasSprite("sink-basin")
    ? propImage("sink-basin", 900, 500, 218, 150)
    : `<rect x="900" y="508" width="218" height="132" fill="#8b5e34" stroke="#241c14" stroke-width="2"/>
       <rect x="914" y="520" width="190" height="96" fill="#c5ccc8" stroke="#241c14" stroke-width="2"/>
       <ellipse cx="1008" cy="572" rx="14" ry="8" fill="#2a3338"/>`;
  const tag = hasSprite("sink-tag")
    ? propImage("sink-tag", 968, 642, 128, 44)
    : `<rect x="980" y="650" width="108" height="28" fill="#f6f0e4" stroke="#241c14" stroke-width="2"/>`;
  const ring = `
    <ellipse cx="1008" cy="592" rx="18" ry="10" fill="none" stroke="#6b4423" stroke-width="2" opacity="0.45"/>
    <ellipse cx="1010" cy="594" rx="10" ry="6" fill="#6b4423" opacity="0.12"/>`;
  const splash = ripple
    ? `<g class="sink-ripple">
         <ellipse cx="1010" cy="575" rx="36" ry="16" fill="none" stroke="#f6f0e4" stroke-width="2"/>
       </g>`
    : "";
  return `
    <g class="sink-zone${klonk ? " is-klonk" : ""}" pointer-events="none">
      ${basin}
      ${ring}
      ${splash}
      ${tag}
      <text x="1040" y="670" text-anchor="middle" class="zone-chip is-on-tag">DONATED / SINK</text>
    </g>`;
}

const FEATURED_SCALE = 1.22;

/** The demo desk sells one hire. Mug is drawn larger than the rest of the roster. */
export function isFeatured(state: CompanyState, id: EmployeeId): boolean {
  const emp = state.employees[id];
  return state.seed === "demo" && id === "mug" && emp?.standing !== "terminated";
}

/** Shared by the rendered pose and the live drag preview so the scale never drops mid-drag. */
export function empTransform(pose: LayoutPose, featured: boolean): string {
  return `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotate}deg) scale(${featured ? FEATURED_SCALE : 1})`;
}

function objectGroup(
  id: EmployeeId,
  state: CompanyState,
  selectedId: EmployeeId | null,
  flashId: EmployeeId | null,
): string {
  const emp = state.employees[id];
  if (!emp) return "";
  const record = STAFF_BY_ID[id];
  const selected = selectedId === id;
  const featured = isFeatured(state, id);
  const flashing = flashId === id;
  const drawerIn = flashing && emp.zone === "drawer";
  const sinkLand = flashing && emp.zone === "sink";
  const label = `${record.name}, ${emp.title}, ${emp.standing}`;
  const pip =
    emp.standing === "on_pip"
      ? hasSprite("pip-sticker")
        ? `<image class="emp-sprite" href="${spriteHref("pip-sticker")}" x="36" y="-10" width="22" height="22"/>`
        : `<g class="pip-badge-g">
             <rect x="36" y="-8" width="24" height="12" fill="#e8c547" stroke="#241c14"/>
             <text class="pip-badge" x="48" y="2" text-anchor="middle" fill="#241c14">PIP</text>
           </g>`
      : "";

  return `
    <g
      class="emp ${selected ? "is-selected" : ""} ${emp.standing === "terminated" ? "is-terminated" : ""} ${featured ? "is-featured" : ""} ${flashing ? "is-flash" : ""} ${drawerIn ? "is-drawer-in" : ""} ${sinkLand ? "is-sink-land" : ""}"
      data-id="${id}"
      data-zone="${emp.zone}"
      tabindex="0"
      role="button"
      aria-label="${escapeHtml(label)}"
      aria-pressed="${selected ? "true" : "false"}"
      style="transform: ${empTransform(emp.pose, featured)}; transform-box: fill-box; transform-origin: 32px 32px;"
    >
      ${renderObjectSvg(id, selected)}
      ${pip}
      <text class="emp-tag" x="32" y="72" text-anchor="middle">${escapeHtml(record.name)}</text>
    </g>
  `;
}

export function renderDeskSvg(
  state: CompanyState,
  selectedId: EmployeeId | null,
  flash: DeskFlash = { id: null, zone: null },
): string {
  const objects = RENDER_ORDER.filter((id) => state.employees[id])
    .map((id) => objectGroup(id, state, selectedId, flash.id))
    .join("");
  const lead = STAFF_BY_ID[state.deskLeadId] ?? STAFF_BY_ID.monitor;
  const count = Object.values(state.employees).filter((emp) => emp && emp.standing !== "terminated").length;
  const zoneFlash = flash.zone
    ? (flash.zone === "shelf" ? SHELF_BOXES : [ZONE_BOX[flash.zone]])
        .map(
          (box) =>
            `<rect class="zone-flash" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="4"/>`,
        )
        .join("")
    : "";

  return `
    <svg
      class="desk-svg"
      data-seed="${state.seed}"
      viewBox="0 0 1200 760"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Top-down view of Desk 4B. ${count} employees sit on the desk. Click an object to open its personnel file. Drag to relocate."
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
        </pattern>
      </defs>

      <rect class="wall" x="0" y="0" width="1200" height="760" fill="#efe6d4"/>
      <rect x="0" y="0" width="1200" height="760" filter="url(#grain)"/>

      <g class="alumni-board">
        <rect x="18" y="78" width="122" height="580" rx="6" fill="url(#cork)" stroke="#8b5e34" stroke-width="3"/>
        <rect x="28" y="92" width="102" height="28" fill="#f6f0e4" stroke="#241c14" stroke-width="1.2"/>
        <text x="79" y="111" text-anchor="middle" class="zone-label">ALUMNI</text>
        ${alumniCards(state)}
      </g>

      <g filter="url(#soft-shadow)">
        <rect x="156" y="64" width="1008" height="632" rx="18" fill="#8b5e34"/>
        <rect x="168" y="76" width="984" height="596" rx="12" fill="url(#wood)"/>
        <rect x="168" y="76" width="984" height="596" rx="12" filter="url(#grain)"/>
      </g>

      <rect x="380" y="300" width="420" height="260" rx="4" fill="#d9c7a1" opacity="0.55" stroke="#8b5e34" stroke-width="1"/>
      <ellipse cx="310" cy="360" rx="26" ry="16" fill="none" stroke="#8b5e34" stroke-width="3" opacity="0.28"/>

      ${shelfFurniture()}
      <text x="430" y="268" class="zone-chip">PRIME</text>
      ${drawerFurniture()}
      ${sinkFurniture(flash.zone === "sink", flash.zone === "sink")}

      <g>
        <rect x="188" y="156" width="168" height="36" rx="2" fill="#f6f0e4" stroke="#241c14" stroke-width="1.3"/>
        <text x="272" y="172" text-anchor="middle" class="nameplate">DESK 4B</text>
        <text x="272" y="186" text-anchor="middle" class="nameplate-sub">INTERIM LEAD: ${escapeHtml(lead.name).toUpperCase()}</text>
      </g>

      ${zoneFlash}
      ${paperStack(state, selectedId)}
      ${objects}
    </svg>
  `;
}
