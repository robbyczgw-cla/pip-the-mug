import { STAFF_BY_ID } from "../data/staff.ts";
import { playPaperShuffle } from "../lib/audio.ts";
import { enqueue } from "../state/queue.ts";
import { listStaffRows, orgChart } from "../state/org.ts";
import { requestTerminationConfirmation } from "./confirm.ts";
import { openPersonnelFile } from "../ui/file.ts";
import {
  activePip,
  beginPendingTermination,
  canTerminate,
  getState,
  rosterIds,
  promote,
  putOnPip,
  relocate,
  resolvePip,
  staffOnPip,
  terminate,
  writeReview,
} from "../state/store.ts";
import type { EmployeeId, PipDays, PipOutcome, Zone } from "../types.ts";

export interface WebMcpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: Record<string, unknown>;
  execute: (input: Record<string, unknown>, extra?: unknown) => Promise<unknown>;
}

function asId(value: unknown): EmployeeId | null {
  if (typeof value !== "string") return null;
  const id = value as EmployeeId;
  return getState().employees[id] ? id : null;
}

function lines(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  return [];
}



function filePayload(id: EmployeeId) {
  const record = STAFF_BY_ID[id];
  const emp = getState().employees[id];
  if (!emp) {
    return {
      id,
      name: record.name,
      error: "unknown_id",
    };
  }
  const open = activePip(emp);
  return {
    id,
    name: record.name,
    role: emp.title,
    department: record.department,
    tenure: record.tenure,
    standing: emp.standing,
    zone: emp.zone,
    reportsTo: emp.reportsTo,
    backstory: record.backstory,
    pastReviews: record.pastReviews,
    liveReviews: emp.reviews.map((review) => ({
      quarter: review.quarter,
      rating: review.rating,
      summary: review.summary,
      strengths: review.strengths,
      concerns: review.concerns,
    })),
    incidents: record.incidents,
    openPip: open
      ? { reason: open.reason, goals: open.goals, days: open.days, startedAt: open.startedAt }
      : null,
    promotedThisQuarter: emp.promotedAtQuarter === getState().quarter,
  };
}

export function buildTools(): WebMcpTool[] {
  const state = getState();
  const ID_ENUM = rosterIds(state);
  const tools: WebMcpTool[] = [
    {
      name: "list_staff",
      title: "List staff",
      description:
        `List current Desk 4B staff with title, department, tenure, standing (active, on_pip, terminated), zone, and last review rating. This desk has ${ID_ENUM.length} employees. Call this first. Terminated staff appear as alumni and have no further write tools. Ids not on this desk are invalid.`,
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () => {
        const rows = listStaffRows(getState());
        return {
          ok: true,
          summary: `Desk 4B roster: ${rows.filter((r) => r.standing !== "terminated").length} active, ${rows.filter((r) => r.standing === "terminated").length} alumni.`,
          staff: rows,
        };
      },
    },
    {
      name: "get_personnel_file",
      title: "Get personnel file",
      description:
        `Open the full personnel file for one employee id (${ID_ENUM.join(", ")}). Returns backstory, historical and live reviews, incidents, and any open PIP. Use after list_staff. Ids not on this desk are invalid.`,
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", enum: ID_ENUM, description: "Employee id from list_staff." },
        },
        required: ["id"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const id = asId(input.id);
        if (!id) return { ok: false, summary: "Unknown employee id.", error: "unknown_id" };
        const file = filePayload(id);
        if ("error" in file) return { ok: false, summary: "Unknown employee id.", error: "unknown_id" };
        openPersonnelFile(id);
        return {
          ok: true,
          summary: `Opened file for ${STAFF_BY_ID[id].name}: ${file.standing}, zone ${file.zone}.`,
          file,
        };
      },
    },
    {
      name: "get_org_chart",
      title: "Get org chart",
      description:
        "Return the current hierarchy. Someone is always Interim Desk Lead (usually Monitor unless you promoted someone else). Terminated staff are omitted. Use this to see reporting lines before promoting or relocating.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () => {
        const chart = orgChart(getState());
        return {
          ok: true,
          summary: `Interim Desk Lead is ${chart.interimDeskLead.name}. ${chart.nodes.length} people on the chart.`,
          chart,
        };
      },
    },
  ];

  const writable = Object.values(state.employees).filter(
    (emp): emp is NonNullable<typeof emp> => Boolean(emp) && emp.standing !== "terminated",
  );
  const LIVE_ENUM = writable.map((emp) => emp.id);
  if (writable.length === 0) return tools;

  tools.push(
    {
      name: "write_review",
      title: "Write review",
      description:
        `File a Q${state.quarter} performance review for an active employee. rating is 1-5. summary is the official paragraph. strengths and concerns are short bullet strings. A filled Form PR-12 appears on the desk. Use after reading the personnel file. Do not review terminated alumni.`,
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", enum: ID_ENUM, description: "Employee id from list_staff. Alumni return ok: false." },
          rating: { type: "integer", minimum: 1, maximum: 5, description: "Overall rating, 1 worst, 5 best." },
          summary: { type: "string", description: "Straight-faced review paragraph." },
          strengths: { type: "array", items: { type: "string" }, description: "Strength bullets." },
          concerns: { type: "array", items: { type: "string" }, description: "Concern bullets." },
        },
        required: ["id", "rating", "summary"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async (input) => {
        const id = asId(input.id);
        if (!id) return { ok: false, summary: "Unknown employee id." };
        const rating = Number(input.rating);
        if (![1, 2, 3, 4, 5].includes(rating)) return { ok: false, summary: "Rating must be 1-5." };
        return enqueue(() => {
          const result = writeReview(
            id,
            {
              rating: rating as 1 | 2 | 3 | 4 | 5,
              summary: String(input.summary ?? ""),
              strengths: lines(input.strengths),
              concerns: lines(input.concerns),
            },
            "agent",
          );
          if (result.ok) playPaperShuffle(getState().soundEnabled);
          return result;
        });
      },
    },
    {
      name: "put_on_pip",
      title: "Put on PIP",
      description:
        "Place an active employee on a Performance Improvement Plan. days must be 30, 60, or 90. goals are measurable desk behaviors (empty the mug, remain attached, etc.). A yellow PIP sticker appears on the object and Form PIP-90 is filed. Cannot be used if a PIP is already open.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", enum: LIVE_ENUM },
          reason: { type: "string", description: "Why the plan is issued." },
          goals: { type: "array", items: { type: "string" }, description: "Plan goals." },
          days: { type: "integer", enum: [30, 60, 90], description: "Plan length." },
        },
        required: ["id", "reason", "goals", "days"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async (input) => {
        const id = asId(input.id);
        if (!id) return { ok: false, summary: "Unknown employee id." };
        const days = Number(input.days) as PipDays;
        if (![30, 60, 90].includes(days)) return { ok: false, summary: "days must be 30, 60, or 90." };
        return enqueue(() => {
          const result = putOnPip(id, { reason: String(input.reason ?? ""), goals: lines(input.goals), days }, "agent");
          if (result.ok) playPaperShuffle(getState().soundEnabled);
          return result;
        });
      },
    },
    {
      name: "promote",
      title: "Promote",
      description:
        "Promote an active employee to new_title and move them to the prime zone near the monitor. Promotion this quarter blocks terminate until the next quarter. Use for overperformers such as Ballpoint Pen. Does not work on alumni.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", enum: LIVE_ENUM },
          new_title: { type: "string", description: "Title after promotion." },
        },
        required: ["id", "new_title"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async (input) => {
        const id = asId(input.id);
        if (!id) return { ok: false, summary: "Unknown employee id." };
        return enqueue(() => promote(id, String(input.new_title ?? "Senior Object"), "agent"));
      },
    },
    {
      name: "relocate",
      title: "Relocate",
      description:
        "Move an active employee to a desk zone: prime (near the monitor), standard (blotter), drawer, or shelf. Do not use sink; that is only for terminate. Dragging in the UI does the same thing.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", enum: LIVE_ENUM },
          zone: { type: "string", enum: ["prime", "standard", "drawer", "shelf"], description: "Destination zone." },
        },
        required: ["id", "zone"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async (input) => {
        const id = asId(input.id);
        const zone = String(input.zone) as Zone;
        if (!id) return { ok: false, summary: "Unknown employee id." };
        if (!["prime", "standard", "drawer", "shelf"].includes(zone)) {
          return { ok: false, summary: "zone must be prime, standard, drawer, or shelf." };
        }
        return enqueue(() => relocate(id, zone, "agent"));
      },
    },
  );

  const onPip = staffOnPip();
  if (onPip.length > 0) {
    tools.push({
      name: "resolve_pip",
      title: "Resolve PIP",
      description:
        "Close an open Performance Improvement Plan. outcome is passed (return to active standing) or failed (PIP ends, standing stays until you terminate). This tool exists only while at least one PIP is open.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", enum: onPip.map((emp) => emp.id), description: "Employee currently on a PIP." },
          outcome: { type: "string", enum: ["passed", "failed"] },
        },
        required: ["id", "outcome"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async (input) => {
        const id = asId(input.id);
        const outcome = String(input.outcome) as PipOutcome;
        if (!id) return { ok: false, summary: "Unknown employee id." };
        if (getState().employees[id]?.standing === "terminated") {
          return { ok: false, summary: `${STAFF_BY_ID[id].name} is alumni. PIP tools are closed.` };
        }
        if (outcome !== "passed" && outcome !== "failed") {
          return { ok: false, summary: "outcome must be passed or failed." };
        }
        return enqueue(() => resolvePip(id, outcome, "agent"));
      },
    });
  }

  tools.push({
    name: "terminate",
    title: "Terminate",
    description:
      "SENSITIVE. Request separation of an employee from Desk 4B. This tool stays registered while anyone is still employed. A same-quarter promotion does not remove the tool. Calling it on a promoted employee returns ok: false with a cooling-off explanation and does not open SEP-1. Alumni return ok: false. If the client has a working confirmation callback, the tool waits for that answer. If the callback is missing or unsupported, including the Codex WebMCP shim, catch that internally. Do not surface a throw. Open Form SEP-1 on the page and return status requires_user_action. Pause and ask the user to click Confirm termination themselves. Do not click that control.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", enum: LIVE_ENUM },
        reason: { type: "string", description: "Separation reason for Form SEP-1." },
      },
      required: ["id", "reason"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    execute: async (input, extra) => {
      const id = asId(input.id);
      if (!id) return { ok: false, summary: "Unknown employee id." };
      const emp = getState().employees[id];
      const name = STAFF_BY_ID[id].name;
      if (!emp || emp.standing === "terminated") {
        return { ok: false, summary: `${name} is alumni and cannot be terminated.` };
      }
      if (!canTerminate(emp, getState().quarter)) {
        return {
          ok: false,
          summary: `${name} was promoted this quarter and is in a protected cooling-off period.`,
        };
      }
      const open = getState().pendingTermination;
      if (open) {
        return {
          ok: false,
          status: "requires_user_action",
          action: "confirm_termination_in_page",
          employeeId: open.employeeId,
          requestId: open.requestId,
          summary:
            "Termination is pending. Ask the user to confirm it in the visible SEP-1 panel. Do not click the confirmation control for them.",
        };
      }
      const reason = String(input.reason ?? "Not specified.");
      const decision = await requestTerminationConfirmation(
        extra,
        `Terminate ${name}? They will be moved to the Donated / Sink box. This cannot be undone except by Reset company.`,
      );
      if (decision.kind === "resolved") {
        if (!decision.confirmed) {
          return { ok: false, summary: `Termination of ${name} cancelled by upper management.` };
        }
        return enqueue(() => {
          const result = terminate(id, reason, "agent");
          if (result.ok) playPaperShuffle(getState().soundEnabled);
          return result;
        });
      }
      const pending = beginPendingTermination(id, reason, "agent");
      return {
        ok: false,
        status: "requires_user_action",
        action: "confirm_termination_in_page",
        employeeId: pending.pending.employeeId,
        requestId: pending.pending.requestId,
        summary:
          "Termination is pending. Ask the user to confirm it in the visible SEP-1 panel. Do not click the confirmation control for them.",
      };
    },
  });

  return tools;
}
