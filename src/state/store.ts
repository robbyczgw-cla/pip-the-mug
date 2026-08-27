import { DEFAULT_LAYOUT, STAFF } from "../data/staff";
import { uid } from "../lib/id";
import type {
  ActivityEntry,
  Actor,
  CompanyState,
  EmployeeId,
  EmployeeRuntime,
  LayoutPose,
  PaperKind,
  PipDays,
  PipOutcome,
  Zone,
} from "../types";
import { EMPLOYEE_IDS } from "../types";
import { occupiedInZone, slotInZone } from "./layout";

export const STATE_VERSION = 1;
export const STORAGE_KEY = "pip-the-mug:v1";

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

function employeeList(current: CompanyState): EmployeeRuntime[] {
  return EMPLOYEE_IDS.map((id) => current.employees[id]);
}

function zoneSlots(current: CompanyState, zone: Zone, except: EmployeeId): LayoutPose[] {
  return occupiedInZone(current.employees, zone, except);
}

export function createDefaultState(): CompanyState {
  const employees = {} as Record<EmployeeId, EmployeeRuntime>;
  for (const record of STAFF) {
    employees[record.id] = {
      id: record.id,
      title: record.defaultTitle,
      zone: record.defaultZone,
      standing: "active",
      reportsTo: record.reportsTo,
      pose: { ...DEFAULT_LAYOUT[record.id] },
      promotedAtQuarter: null,
      reviews: [],
      pips: [],
    };
  }
  return {
    version: STATE_VERSION,
    quarter: 3,
    deskLeadId: "monitor",
    soundEnabled: false,
    employees,
    alumni: [],
    activity: [],
    papers: [],
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode */
  }
}

export function loadState(): CompanyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state = createDefaultState();
      return state;
    }
    const parsed = JSON.parse(raw) as CompanyState;
    if (parsed.version !== STATE_VERSION || !parsed.employees?.mug) {
      state = createDefaultState();
      return state;
    }
    state = parsed;
    return state;
  } catch {
    state = createDefaultState();
    return state;
  }
}

export function replaceState(next: CompanyState, silent = false): void {
  state = next;
  if (!silent) emit();
  else persist();
}

export function resetCompany(actor: Actor): CompanyState {
  const next = createDefaultState();
  next.activity = log(next, "reset_company", actor, "Company records reset to the last clean quarter.");
  state = next;
  emit();
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
    activity: log(state, "terminate", actor, summary, id),
  };
  emit();
  return { ok: true, summary };
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
