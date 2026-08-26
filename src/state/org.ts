import { STAFF_BY_ID } from "../data/staff";
import type { CompanyState, EmployeeId } from "../types";

export interface OrgNode {
  id: EmployeeId;
  name: string;
  title: string;
  standing: string;
  reportsTo: EmployeeId | null;
  reports: EmployeeId[];
}

export function orgChart(state: CompanyState): {
  interimDeskLead: { id: EmployeeId; name: string; title: string };
  nodes: OrgNode[];
} {
  const nodes: OrgNode[] = [];
  for (const emp of Object.values(state.employees)) {
    if (emp.standing === "terminated") continue;
    const record = STAFF_BY_ID[emp.id];
    nodes.push({
      id: emp.id,
      name: record.name,
      title: emp.title,
      standing: emp.standing,
      reportsTo: emp.id === state.deskLeadId ? null : emp.reportsTo,
      reports: Object.values(state.employees)
        .filter((other) => other.standing !== "terminated" && other.reportsTo === emp.id && other.id !== state.deskLeadId)
        .map((other) => other.id),
    });
  }
  const lead = state.employees[state.deskLeadId];
  return {
    interimDeskLead: {
      id: lead.id,
      name: STAFF_BY_ID[lead.id].name,
      title: "Interim Desk Lead",
    },
    nodes,
  };
}

export function listStaffRows(state: CompanyState) {
  return Object.values(state.employees).map((emp) => {
    const record = STAFF_BY_ID[emp.id];
    const openPip = emp.pips.find((pip) => !pip.outcome);
    return {
      id: emp.id,
      name: record.name,
      role: emp.title,
      department: record.department,
      tenure: record.tenure,
      standing: emp.standing,
      zone: emp.zone,
      reportsTo: emp.reportsTo,
      pipDays: openPip?.days ?? null,
      lastRating: emp.reviews[0]?.rating ?? record.pastReviews[0]?.rating ?? null,
    };
  });
}
