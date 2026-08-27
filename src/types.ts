export const EMPLOYEE_IDS = [
  "mug",
  "pen",
  "pen-2",
  "monitor",
  "plant",
  "charger",
  "sticky-notes",
  "scissors",
  "stapler",
  "coaster",
  "webcam-cover",
  "usb-hub",
  "stress-ball",
] as const;

export type EmployeeId = (typeof EMPLOYEE_IDS)[number];

export type DeskSeed = "open" | "demo" | "qa";

export type Zone = "prime" | "standard" | "drawer" | "shelf" | "sink";

export type Standing = "active" | "on_pip" | "terminated";

export type Actor = "agent" | "human" | "system";

export type PipDays = 30 | 60 | 90;

export type PipOutcome = "passed" | "failed";

export interface HistoricalReview {
  quarter: string;
  rating: 1 | 2 | 3 | 4 | 5;
  summary: string;
}

export interface Incident {
  date: string;
  note: string;
}

export interface StaffRecord {
  id: EmployeeId;
  name: string;
  role: string;
  department: string;
  tenure: string;
  reportsTo: EmployeeId | null;
  defaultZone: Zone;
  defaultTitle: string;
  pronouns: string;
  backstory: string[];
  pastReviews: HistoricalReview[];
  incidents: Incident[];
}

export interface Point {
  x: number;
  y: number;
}

export interface LayoutPose {
  x: number;
  y: number;
  rotate: number;
}

export interface ReviewRecord {
  id: string;
  employeeId: EmployeeId;
  rating: 1 | 2 | 3 | 4 | 5;
  summary: string;
  strengths: string[];
  concerns: string[];
  at: string;
  quarter: number;
}

export interface PipRecord {
  id: string;
  employeeId: EmployeeId;
  reason: string;
  goals: string[];
  days: PipDays;
  startedAt: string;
  outcome?: PipOutcome;
  resolvedAt?: string;
}

export interface TerminationRecord {
  employeeId: EmployeeId;
  reason: string;
  at: string;
}

export interface ActivityEntry {
  id: string;
  at: string;
  tool: string;
  actor: Actor;
  summary: string;
  employeeId?: EmployeeId;
}

export type PaperKind = "review" | "pip" | "termination";

export interface PaperItem {
  id: string;
  kind: PaperKind;
  employeeId: EmployeeId;
  createdAt: string;
}

export interface PendingTermination {
  requestId: string;
  employeeId: EmployeeId;
  reason: string;
}

export interface EmployeeRuntime {
  id: EmployeeId;
  title: string;
  zone: Zone;
  standing: Standing;
  reportsTo: EmployeeId | null;
  pose: LayoutPose;
  promotedAtQuarter: number | null;
  reviews: ReviewRecord[];
  pips: PipRecord[];
}

export interface CompanyState {
  version: number;
  seed: DeskSeed;
  quarter: number;
  deskLeadId: EmployeeId;
  soundEnabled: boolean;
  employees: Partial<Record<EmployeeId, EmployeeRuntime>>;
  alumni: TerminationRecord[];
  activity: ActivityEntry[];
  papers: PaperItem[];
  pendingTermination: PendingTermination | null;
}

export interface ToolResult<T> {
  ok: boolean;
  summary: string;
  data?: T;
  error?: string;
}
