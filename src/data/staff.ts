import type { EmployeeId, LayoutPose, StaffRecord } from "../types";

export const COMPANY = {
  legalName: "Desktop Holdings LLC",
  desk: "Desk 4B",
  fiscalYear: "FY26",
  defaultQuarter: 3,
} as const;

export const STAFF: StaffRecord[] = [
  {
    id: "monitor",
    name: "Monitor",
    role: "Interim Desk Lead",
    department: "Executive",
    tenure: "6 years",
    reportsTo: null,
    defaultZone: "prime",
    defaultTitle: "Interim Desk Lead",
    pronouns: "it/its",
    backstory: [
      "Monitor occupies the prime sightline and has not been replaced since 2019, which Monitor describes as a leadership choice.",
      "Dead pixels in the upper left have been reclassified as institutional knowledge. Brightness is stuck at a level Facilities calls 'assertive.'",
      "Monitor hosts every meeting, usually while displaying a calendar from last March. Direct reports describe Monitor as always on, which is accurate and not a compliment.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 3,
        summary:
          "Meets expectations for remaining on. Has not powered down during business hours. Still showing a calendar from last March.",
      },
    ],
    incidents: [
      {
        date: "4 Jan 2026",
        note: "Refused to display a spreadsheet until someone wiggled the cable. Cable was not loose.",
      },
    ],
  },
  {
    id: "mug",
    name: "Mug",
    role: "Senior Beverage Retention Specialist",
    department: "Beverages",
    tenure: "4 years (current contents: 3 weeks)",
    reportsTo: "monitor",
    defaultZone: "standard",
    defaultTitle: "Senior Beverage Retention Specialist",
    pronouns: "it/its",
    backstory: [
      "The incumbent has maintained a single serving of coffee at ambient temperature for twenty-one consecutive days.",
      "Stakeholders report the liquid has developed a film that Legal has asked us not to characterize. Mug's stated goal this quarter is to remain full.",
      "Attendance is technically perfect: Mug has not left the desk. A prior review noted strong containment skills and limited initiative regarding emptying.",
    ],
    pastReviews: [
      {
        quarter: "Q1 FY26",
        rating: 2,
        summary:
          "Retention exceeds target. Emptying remains an unresolved development area. Contents have outlasted two project kickoffs.",
      },
    ],
    incidents: [
      {
        date: "11 Aug 2026",
        note: "A visitor asked if the coffee was still good. Mug did not answer. The visitor did not drink it.",
      },
    ],
  },
  {
    id: "coaster",
    name: "Coaster",
    role: "Workplace Amenities Associate",
    department: "Beverages",
    tenure: "4 years",
    reportsTo: "mug",
    defaultZone: "standard",
    defaultTitle: "Workplace Amenities Associate",
    pronouns: "it/its",
    backstory: [
      "Coaster reports directly to Mug and has not been used. Condensation is handled by the desk.",
      "Coaster's development plan is: be under the mug. Coaster completed mandatory training on circular workplace objects and filed the certificate underneath itself.",
      "Promotion to used coaster remains pending Mug's cooperation. Coaster is ready to start immediately.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 3,
        summary:
          "Fully available. Utilization at 0%. Manager has not assigned work that would require sitting on Coaster.",
      },
    ],
    incidents: [],
  },
  {
    id: "pen",
    name: "Ballpoint Pen",
    role: "Staff Scribe",
    department: "Written Output",
    tenure: "2 years",
    reportsTo: "usb-hub",
    defaultZone: "standard",
    defaultTitle: "Staff Scribe",
    pronouns: "it/its",
    backstory: [
      "Pen produces ninety-four percent of all written output on this desk. Colleagues routinely borrow Pen without submitting a ticket.",
      "Last quarter Pen completed a crossword, three grocery lists, and the only signed expense report.",
      "Pen has asked, through a worn barrel, for a replacement cartridge. Facilities marked the request working as designed.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 5,
        summary:
          "Exceeds expectations. Carries written output for the floor. Click mechanism still functional after heavy use.",
      },
    ],
    incidents: [
      {
        date: "22 May 2026",
        note: "Found behind the monitor after an all-hands. Returned to the blotter without a lost-and-found ticket.",
      },
    ],
  },
  {
    id: "pen-2",
    name: "Second Ballpoint Pen",
    role: "Associate Scribe",
    department: "Written Output",
    tenure: "2 years",
    reportsTo: "usb-hub",
    defaultZone: "standard",
    defaultTitle: "Associate Scribe",
    pronouns: "it/its",
    backstory: [
      "Second Pen was hired the same week as Pen, in a pairing intended to provide redundancy.",
      "Output this year: one faint line, attributed to a pocket. Second Pen's cap remains on.",
      "When asked about utilization, Second Pen's manager noted that the other one is right there. Second Pen is currently aligning on a writing strategy.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 3,
        summary:
          "Meets the letter of being a pen. Has not dried out, which is the current performance bar.",
      },
    ],
    incidents: [],
  },
  {
    id: "plant",
    name: "Desk Plant",
    role: "Chief Morale Officer",
    department: "People & Culture",
    tenure: "11 months",
    reportsTo: "monitor",
    defaultZone: "shelf",
    defaultTitle: "Chief Morale Officer",
    pronouns: "it/its",
    backstory: [
      "Plant was purchased to improve engagement scores after the stapler incident. Watering is listed as a shared responsibility, which means it has not occurred.",
      "Two leaves remain. Plant continues to submit optimistic standup updates: still here, still green-adjacent.",
      "People Ops considers Plant a success because it has not been thrown away.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 2,
        summary:
          "Morale contribution is visual and declining. Photosynthesis KPIs missed. Still technically a plant.",
      },
    ],
    incidents: [
      { date: "3 Jun 2026", note: "Leaf drop, fourteen counts. Soil compacted. No watering ticket filed." },
    ],
  },
  {
    id: "charger",
    name: "Phone Charger",
    role: "IT Liaison",
    department: "Connectivity",
    tenure: "3 years",
    reportsTo: "usb-hub",
    defaultZone: "drawer",
    defaultTitle: "IT Liaison",
    pronouns: "it/its",
    backstory: [
      "Charger is assigned to this desk but is presently in a conference room, a kitchen, or a coat pocket.",
      "Asset tracking lists Charger's location as circulating. When present, Charger works at eleven watts and becomes warm enough to concern Facilities.",
      "Charger has never completed a full charge on its home device.",
    ],
    pastReviews: [
      {
        quarter: "Q1 FY26",
        rating: 3,
        summary:
          "High demand across departments. Home-desk availability below target. Cable still original.",
      },
    ],
    incidents: [
      {
        date: "18 Jul 2026",
        note: "Returned from Finance with a different wall brick. Serial numbers do not match. Kept anyway.",
      },
    ],
  },
  {
    id: "sticky-notes",
    name: "Sticky Notes",
    role: "Records Manager",
    department: "Institutional Memory",
    tenure: "8 years",
    reportsTo: "monitor",
    defaultZone: "standard",
    defaultTitle: "Records Manager",
    pronouns: "they/them",
    backstory: [
      "Sticky Notes holds the only current copy of the wifi password, a dentist appointment from 2024, and the phrase don't forget.",
      "Adhesion has declined. Notes regularly relocate to the floor, the monitor bezel, and once the plant.",
      "Sticky Notes is the organization's institutional memory and is also how the organization loses things.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 4,
        summary:
          "Knows everything that was written down. Cannot locate most of it. Ink still legible on the top sheet.",
      },
    ],
    incidents: [
      {
        date: "9 Apr 2026",
        note: "The wifi password note fell behind the drawer. Network was reset. The note has not been recovered.",
      },
    ],
  },
  {
    id: "scissors",
    name: "Scissors",
    role: "Special Projects",
    department: "Operations",
    tenure: "5 years",
    reportsTo: "usb-hub",
    defaultZone: "drawer",
    defaultTitle: "Special Projects",
    pronouns: "they/them",
    backstory: [
      "Scissors is located immediately when a letter needs opening and is unfindable when a package arrives.",
      "Inventory counts Scissors as present on alternate Tuesdays. Safety training is overdue.",
      "Scissors' last performance review cited high impact, low availability, which Scissors did not attend.",
    ],
    pastReviews: [
      {
        quarter: "Q4 FY25",
        rating: 3,
        summary:
          "Cuts when present. Presence is the open question. Left-handed employees have filed no complaints because they have not found Scissors either.",
      },
    ],
    incidents: [
      {
        date: "2 Feb 2026",
        note: "Used to open a bag of chips. That is not a listed duty. No further action.",
      },
    ],
  },
  {
    id: "stapler",
    name: "Stapler",
    role: "Workplace Continuity",
    department: "Facilities",
    tenure: "Since 2019 (hiring record missing)",
    reportsTo: "monitor",
    defaultZone: "standard",
    defaultTitle: "Workplace Continuity",
    pronouns: "it/its",
    backstory: [
      "Stapler has been on the desk since 2019. No offer letter exists. Payroll has no record.",
      "Stapler continues to staple, usually once, then jam. Attempts to relocate Stapler result in Stapler returning by morning.",
      "A 2022 audit concluded Stapler is probably ours.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 3,
        summary:
          "Tenure exceeds every other object except Monitor. Onboarding paperwork still outstanding. Jams on the third staple.",
      },
    ],
    incidents: [
      {
        date: "2019",
        note: "Appeared. Origin unknown. Assigned a desk by default.",
      },
      {
        date: "14 Oct 2025",
        note: "The stapler incident. Details sealed. Plant was purchased afterward.",
      },
    ],
  },
  {
    id: "webcam-cover",
    name: "Webcam Cover",
    role: "Information Security Analyst",
    department: "Security",
    tenure: "1 year",
    reportsTo: "monitor",
    defaultZone: "prime",
    defaultTitle: "Information Security Analyst",
    pronouns: "it/its",
    backstory: [
      "Webcam Cover is the entire security department. Cover is currently slid to the closed position, which Cover considers a completed OKR.",
      "Cover has never filed an incident because Cover prevents them.",
      "When the camera is needed for a review, Cover is accused of being overly cautious, which is the job.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 4,
        summary:
          "Zero camera incidents on Cover's watch. Stakeholders complain they cannot be seen. Cover considers this confirmation.",
      },
    ],
    incidents: [],
  },
  {
    id: "usb-hub",
    name: "USB Hub",
    role: "Director of Connectivity",
    department: "Connectivity",
    tenure: "4 years",
    reportsTo: "monitor",
    defaultZone: "standard",
    defaultTitle: "Director of Connectivity",
    pronouns: "it/its",
    backstory: [
      "USB Hub's function is to receive work and pass it along. Hub has seven ports. Three work. Hub describes this as delegation.",
      "Status lights blink with no corresponding activity. Direct reports plug in and wait.",
      "Hub's last self-review was I enable others, which Legal asked Hub not to put in writing.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 3,
        summary:
          "Middle of every cable path. Adds latency. Has not dropped a device this quarter, except the ones on the dead ports.",
      },
    ],
    incidents: [
      {
        date: "28 Mar 2026",
        note: "A flash drive was inserted and was not seen again. Hub declined to comment.",
      },
    ],
  },
  {
    id: "stress-ball",
    name: "Stress Ball",
    role: "People Partner",
    department: "People & Culture",
    tenure: "6 months",
    reportsTo: "monitor",
    defaultZone: "standard",
    defaultTitle: "People Partner",
    pronouns: "it/its",
    backstory: [
      "Stress Ball was hired by HR after a difficult quarter involving the stapler. Usage is above capacity. Foam has thinned.",
      "Stress Ball is invited to every tense conversation and is never introduced. HR lists Stress Ball as highly engaged.",
      "Stress Ball would like a day off and does not have hands to request one.",
    ],
    pastReviews: [
      {
        quarter: "Q2 FY26",
        rating: 5,
        summary:
          "Absorbs pressure as designed. Surface pilling noted. Do not schedule additional squeeze events until foam recovers.",
      },
    ],
    incidents: [
      {
        date: "7 Aug 2026",
        note: "Rolled under the monitor during a budget meeting. Recovered. Slightly flatter.",
      },
    ],
  },
];

export const STAFF_BY_ID: Record<EmployeeId, StaffRecord> = Object.fromEntries(
  STAFF.map((record) => [record.id, record]),
) as Record<EmployeeId, StaffRecord>;

export const DEFAULT_LAYOUT: Record<EmployeeId, LayoutPose> = {
  monitor: { x: 430, y: 92, rotate: 0 },
  "webcam-cover": { x: 618, y: 100, rotate: 0 },
  plant: { x: 868, y: 150, rotate: -6 },
  "usb-hub": { x: 292, y: 198, rotate: 8 },
  charger: { x: 188, y: 250, rotate: -18 },
  mug: { x: 248, y: 318, rotate: 4 },
  coaster: { x: 252, y: 372, rotate: -8 },
  "sticky-notes": { x: 538, y: 318, rotate: -7 },
  pen: { x: 390, y: 408, rotate: 42 },
  "pen-2": { x: 448, y: 458, rotate: -24 },
  stapler: { x: 628, y: 428, rotate: 14 },
  scissors: { x: 778, y: 388, rotate: 28 },
  "stress-ball": { x: 718, y: 278, rotate: 0 },
};

export const RENDER_ORDER: EmployeeId[] = [
  "coaster",
  "charger",
  "usb-hub",
  "sticky-notes",
  "pen-2",
  "pen",
  "stapler",
  "scissors",
  "stress-ball",
  "plant",
  "mug",
  "monitor",
  "webcam-cover",
];
