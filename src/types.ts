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

export type Zone = "prime" | "standard" | "drawer" | "shelf" | "sink";

export type Standing = "active" | "on_pip" | "terminated";

export type Actor = "agent" | "human";

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
