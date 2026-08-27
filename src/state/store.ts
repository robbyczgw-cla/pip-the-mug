import { DEFAULT_LAYOUT, STAFF_BY_ID } from "../data/staff.ts";
import {
  DEMO_LAYOUT,
  DEMO_REPORTS,
  DEMO_ZONES,
  LEGACY_STORAGE_KEY,
  isDemoId,
  rosterFor,
  storageKey,
} from "../data/seeds.ts";
import { uid } from "../lib/id.ts";
import type {
  ActivityEntry,
  Actor,
  CompanyState,
  DeskSeed,
  EmployeeId,
  EmployeeRuntime,
  LayoutPose,
  PaperKind,
  PendingTermination,
  PipDays,
  PipOutcome,
  Zone,
} from "../types.ts";
import { occupiedInZone, slotInZone } from "./layout.ts";

export const STATE_VERSION = 2;

type Listener = (state: CompanyState) => void;

const listeners = new Set<Listener>();
let state: CompanyState = createDefaultState();

function log(
  current: CompanyState,
  tool: string,
  actor: Actor,
  summary: string,
  employeeId?: EmployeeId,
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: uid("log"),
    at: new Date().toISOString(),
    tool,
    actor,
    summary,
    employeeId,
  };
  return [entry, ...current.activity].slice(0, 80);
}

function paper(current: CompanyState, kind: PaperKind, employeeId: EmployeeId): CompanyState["papers"] {
  return [
    {
      id: uid("paper"),
      kind,
      employeeId,
      createdAt: new Date().toISOString(),
    },
    ...current.papers,
  ].slice(0, 12);
}

export function rosterIds(current: CompanyState = state): EmployeeId[] {
  return (Object.keys(current.employees) as EmployeeId[]).filter((id) => current.employees[id]);
}

function employeeList(current: CompanyState): EmployeeRuntime[] {
  return rosterIds(current).map((id) => current.employees[id]!);
}

function zoneSlots(current: CompanyState, zone: Zone, except: EmployeeId): LayoutPose[] {
  return occupiedInZone(current.employees, zone, except);
}

export function createDefaultState(seed: DeskSeed = "open"): CompanyState {
  const employees: CompanyState["employees"] = {};
  for (const id of rosterFor(seed)) {
    const record = STAFF_BY_ID[id];
    const demo = seed === "demo" && isDemoId(id);
    employees[id] = {
      id,
      title: record.defaultTitle,
      zone: demo ? DEMO_ZONES[id] : record.defaultZone,
      standing: "active",
      reportsTo: demo ? DEMO_REPORTS[id] : record.reportsTo,
      pose: { ...(demo ? DEMO_LAYOUT[id] : DEFAULT_LAYOUT[id]) },
      promotedAtQuarter: null,
      reviews: [],
      pips: [],
    };
  }
  return {
    version: STATE_VERSION,
    seed,
    quarter: 3,
    deskLeadId: "monitor",
    soundEnabled: false,
    employees,
    alumni: [],
    activity: [],
    papers: [],
    pendingTermination: null,
  };
}

export function getState(): CompanyState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  persist();
  const snapshot = state;
  for (const listener of listeners) listener(snapshot);
}

function persist(): void {
  try {
    localStorage.setItem(storageKey(state.seed), JSON.stringify(state));
  } catch {
    /* private mode */
  }
}

function migrateLegacyOpenDesk(): void {
  try {
    if (localStorage.getItem(storageKey("open"))) return;
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return;
    const parsed = JSON.parse(legacy) as CompanyState;
    parsed.version = STATE_VERSION;
    parsed.seed = "open";
    parsed.pendingTermination = parsed.pendingTermination ?? null;
    localStorage.setItem(storageKey("open"), JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

function clipToRoster(parsed: CompanyState, seed: DeskSeed): CompanyState {
  const defaults = createDefaultState(seed);
  const allowed = rosterFor(seed);
  const allowedSet = new Set(allowed);
  const employees: CompanyState["employees"] = {};
  for (const id of allowed) {
    const emp = parsed.employees[id] ?? defaults.employees[id]!;
    employees[id] = {
      ...emp,
      reviews: emp.reviews ?? [],
      pips: emp.pips ?? [],
    };
  }
  const pending = parsed.pendingTermination;
  return {
    ...parsed,
    version: STATE_VERSION,
    seed,
    deskLeadId: allowedSet.has(parsed.deskLeadId) ? parsed.deskLeadId : "monitor",
    employees,
    alumni: (parsed.alumni ?? []).filter((row) => allowedSet.has(row.employeeId)),
    papers: (parsed.papers ?? []).filter((item) => allowedSet.has(item.employeeId)),
    activity: (parsed.activity ?? []).filter((entry) => !entry.employeeId || allowedSet.has(entry.employeeId)),
    pendingTermination: pending && allowedSet.has(pending.employeeId) ? pending : null,
  };
}

export function loadState(seed: DeskSeed = "open"): CompanyState {
  try {
    if (seed === "open") migrateLegacyOpenDesk();
    const raw = localStorage.getItem(storageKey(seed));
    if (!raw) {
      state = createDefaultState(seed);
      persist();
      applySeedPlot(seed);
      return state;
    }
    const parsed = JSON.parse(raw) as CompanyState;
    if (!parsed.employees?.mug) {
      state = createDefaultState(seed);
      persist();
      applySeedPlot(seed);
      return state;
    }
    state = clipToRoster(parsed, seed);
    persist();
    return state;
  } catch {
    state = createDefaultState(seed);
    persist();
    applySeedPlot(seed);
    return state;
  }
}

export function resetCompany(actor: Actor): CompanyState {
  const seed = state.seed;
  const next = createDefaultState(seed);
  next.activity = log(next, "reset_company", actor, "Company records reset to the last clean quarter.");
  state = next;
  emit();
  applySeedPlot(seed);
  return state;
}

export function toggleSound(): CompanyState {
  state = { ...state, soundEnabled: !state.soundEnabled };
  emit();
  return state;
}

export function activePip(emp: EmployeeRuntime) {
  return emp.pips.find((pip) => !pip.outcome);
}

export function staffOnPip(current: CompanyState = state): EmployeeRuntime[] {
  return employeeList(current).filter((emp) => emp.standing === "on_pip" && activePip(emp));
}

export function canTerminate(emp: EmployeeRuntime, quarter: number): boolean {
  return emp.standing !== "terminated" && emp.promotedAtQuarter !== quarter;
}

export function writeReview(
  id: EmployeeId,
  input: { rating: 1 | 2 | 3 | 4 | 5; summary: string; strengths: string[]; concerns: string[] },
  actor: Actor,
): { ok: boolean; summary: string } {
  const emp = state.employees[id];
  if (!emp || emp.standing === "terminated") {
    return { ok: false, summary: `No active file for ${id}.` };
  }
  const review = {
    id: uid("rev"),
    employeeId: id,
    rating: input.rating,
    summary: input.summary,
    strengths: input.strengths,
    concerns: input.concerns,
    at: new Date().toISOString(),
    quarter: state.quarter,
  };
  const nextEmp = { ...emp, reviews: [review, ...emp.reviews] };
  const summary = `Q${state.quarter} review filed for ${emp.title} (${id}): ${input.rating}/5.`;
  state = {
    ...state,
    employees: { ...state.employees, [id]: nextEmp },
    papers: paper(state, "review", id),
    activity: log(state, "write_review", actor, summary, id),
  };
  emit();
  return { ok: true, summary };
}

export function putOnPip(
  id: EmployeeId,
  input: { reason: string; goals: string[]; days: PipDays },
  actor: Actor,
): { ok: boolean; summary: string } {
  const emp = state.employees[id];
  if (!emp || emp.standing === "terminated") {
    return { ok: false, summary: `Cannot place ${id} on a PIP.` };
  }
  if (emp.standing === "on_pip" || activePip(emp)) {
    return { ok: false, summary: `${id} already has a PIP on file.` };
  }
  const pip = {
    id: uid("pip"),
    employeeId: id,
    reason: input.reason,
    goals: input.goals,
    days: input.days,
    startedAt: new Date().toISOString(),
  };
  const nextEmp: EmployeeRuntime = {
    ...emp,
    standing: "on_pip",
    pips: [pip, ...emp.pips],
  };
  const summary = `${id} placed on a ${input.days}-day PIP: ${input.reason}`;
  state = {
    ...state,
    employees: { ...state.employees, [id]: nextEmp },
    papers: paper(state, "pip", id),
    activity: log(state, "put_on_pip", actor, summary, id),
  };
  emit();
  return { ok: true, summary };
}

export function resolvePip(
  id: EmployeeId,
  outcome: PipOutcome,
  actor: Actor,
): { ok: boolean; summary: string } {
  const emp = state.employees[id];
  const open = emp ? activePip(emp) : undefined;
  if (!emp || !open) {
    return { ok: false, summary: `No open PIP for ${id}.` };
  }
  const pip = { ...open, outcome, resolvedAt: new Date().toISOString() };
  const nextEmp: EmployeeRuntime = {
    ...emp,
    standing: outcome === "passed" ? "active" : "on_pip",
    pips: emp.pips.map((item) => (item.id === pip.id ? pip : item)),
  };
  const summary =
    outcome === "passed"
      ? `PIP closed for ${id}: passed. Returned to active standing.`
      : `PIP closed for ${id}: failed. Sticker stays. File a termination packet.`;
  state = {
    ...state,
    employees: { ...state.employees, [id]: nextEmp },
    activity: log(state, "resolve_pip", actor, summary, id),
  };
  emit();
  return { ok: true, summary };
}

export function promote(id: EmployeeId, newTitle: string, actor: Actor): { ok: boolean; summary: string } {
  const emp = state.employees[id];
  if (!emp || emp.standing === "terminated") {
    return { ok: false, summary: `Cannot promote ${id}.` };
  }
  const pose = slotInZone("prime", zoneSlots(state, "prime", id));
  const nextEmp: EmployeeRuntime = {
    ...emp,
    title: newTitle,
    zone: "prime",
    pose,
    promotedAtQuarter: state.quarter,
    reportsTo: emp.id === "monitor" ? null : "monitor",
  };
  const deskLeadId = emp.id === "monitor" ? state.deskLeadId : id === "monitor" ? id : state.deskLeadId;
  const summary = `${id} promoted to ${newTitle} and moved to the prime spot.`;
  state = {
    ...state,
    deskLeadId,
    employees: { ...state.employees, [id]: nextEmp },
    activity: log(state, "promote", actor, summary, id),
  };
  emit();
  return { ok: true, summary };
}

export function relocate(
  id: EmployeeId,
  zone: Zone,
  actor: Actor,
  prefer?: LayoutPose,
): { ok: boolean; summary: string } {
  const emp = state.employees[id];
  if (!emp || emp.standing === "terminated") {
    return { ok: false, summary: `Cannot relocate ${id}.` };
  }
  if (zone === "sink") {
    return { ok: false, summary: "The sink is for donated alumni. Use terminate." };
  }
  const pose = slotInZone(zone, zoneSlots(state, zone, id), prefer);
  const nextEmp = { ...emp, zone, pose };
  const summary = `${id} relocated to the ${zone} zone.`;
  state = {
    ...state,
    employees: { ...state.employees, [id]: nextEmp },
    activity: log(state, "relocate", actor, summary, id),
  };
  emit();
  return { ok: true, summary };
}

export function terminate(
  id: EmployeeId,
  reason: string,
  actor: Actor,
): { ok: boolean; summary: string } {
  const emp = state.employees[id];
  if (!emp) return { ok: false, summary: `Unknown employee ${id}.` };
  if (emp.standing === "terminated") {
    return { ok: false, summary: `${id} is already alumni.` };
  }
  if (!canTerminate(emp, state.quarter)) {
    return {
      ok: false,
      summary: `${id} was promoted this quarter and is in a protected cooling-off period.`,
    };
  }
  const pose = slotInZone("sink", zoneSlots(state, "sink", id));
  const nextEmp: EmployeeRuntime = {
    ...emp,
    standing: "terminated",
    zone: "sink",
    pose,
    title: `${emp.title} (former)`,
  };
  let deskLeadId = state.deskLeadId;
  if (deskLeadId === id) {
    deskLeadId = employeeList(state).find((item) => item.id !== id && item.standing !== "terminated")?.id ?? "monitor";
  }
  const summary = `${id} terminated: ${reason}. Moved to Donated / Sink.`;
  state = {
    ...state,
    deskLeadId,
    employees: { ...state.employees, [id]: nextEmp },
    alumni: [{ employeeId: id, reason, at: new Date().toISOString() }, ...state.alumni],
    papers: paper(state, "termination", id),
    pendingTermination: null,
    activity: log(state, "terminate", actor, summary, id),
  };
  emit();
  return { ok: true, summary };
}

export function beginPendingTermination(
  id: EmployeeId,
  reason: string,
  actor: Actor,
): { created: boolean; pending: PendingTermination } {
  if (state.pendingTermination) {
    emit();
    return { created: false, pending: state.pendingTermination };
  }
  const pending: PendingTermination = {
    requestId: uid("sep"),
    employeeId: id,
    reason,
  };
  const summary = `Termination of ${id} is pending Form SEP-1. Upper management must click Confirm termination.`;
  state = {
    ...state,
    pendingTermination: pending,
    activity: log(state, "terminate", actor, summary, id),
  };
  emit();
  return { created: true, pending };
}

export function consumePendingTermination(): PendingTermination | null {
  const pending = state.pendingTermination;
  if (!pending) return null;
  state = { ...state, pendingTermination: null };
  emit();
  return pending;
}

export function clearPendingTermination(): void {
  if (!state.pendingTermination) return;
  state = { ...state, pendingTermination: null };
  emit();
}

export function setDeskLead(id: EmployeeId, actor: Actor): void {
  if (state.employees[id]?.standing === "terminated") return;
  const summary = `${id} named Interim Desk Lead.`;
  state = {
    ...state,
    deskLeadId: id,
    activity: log(state, "set_desk_lead", actor, summary, id),
  };
  emit();
}

export function closeQuarter(actor: Actor): { ok: boolean; summary: string } {
  const previous = state.quarter;
  const next = previous + 1;
  const summary = `Closed Q${previous}. Desk is now in Q${next}. Promotion cooling-off from Q${previous} has expired.`;
  state = {
    ...state,
    quarter: next,
    activity: log(state, "close_quarter", actor, summary),
  };
  emit();
  return { ok: true, summary };
}

function applySeedPlot(seed: DeskSeed): void {
  if (seed === "open") return;
  writeReview(
    "pen",
    {
      rating: 5,
      summary:
        "Pen continues to produce nearly all written output on Desk 4B. Colleagues still borrow without tickets. Cartridge request remains open.",
      strengths: ["Volume", "Reliability", "The only signed expense report"],
      concerns: [
        "Barrel wear",
        seed === "qa" ? "No backup because Second Pen will not uncap" : "Single point of failure for written output",
      ],
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
  if (seed === "qa") {
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
  }
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
}
