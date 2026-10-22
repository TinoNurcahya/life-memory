export interface MemoryEvent {
  id: string;
  date: string;
  time?: string;
  text: string;
  category: "career" | "social" | "health" | "learning" | "leisure" | "routine" | "other";
  people?: string[];
  places?: string[];
  topics?: string[];
  isFirstTime?: boolean;
}

export interface MemoryNode {
  id: string;
  type: "person" | "place" | "topic" | "activity";
  label: string;
  weight: number;
  date?: string;
  category?: string;
  x?: number;
  y?: number;
}

export interface MemoryConnection {
  source: string;
  target: string;
  weight: number;
  label?: string;
}

export interface FirstTimeMemory {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  context: string;
  category: string;
}

export interface LifePattern {
  id: string;
  label: string;
  category: string;
  frequency: string;
  months: {
    month: string;
    count: number;
  }[];
  insight: string;
}

export interface BehaviorChange {
  id: string;
  periodThen: string;
  periodNow: string;
  descriptionThen: string;
  descriptionNow: string;
  sequenceThen: string[];
  sequenceNow: string[];
  evidenceText: string;
}

export const JIMMY_DATASET = {
  stats: {
    daysRemembered: 31,
    momentsRecorded: 74,
    placesVisited: 12,
    peopleMentioned: 8,
    recurringPatterns: 5,
    firstsCount: 4,
    significantChanges: 2,
  },

  defaultSeedLog:
    "Worked from the office. Had coffee with Raka after work. Went home late because of rain.",

  extractedItems: [
    { label: "WORK", type: "activity", category: "career", timeHint: "daytime" },
    { label: "OFFICE", type: "place", category: "career", timeHint: "10:00 - 17:00" },
    { label: "RAKA", type: "person", category: "social", timeHint: "after work" },
    { label: "COFFEE", type: "topic", category: "leisure", timeHint: "17:30" },
    { label: "RAIN", type: "context", category: "routine", timeHint: "weather" },
    { label: "21:43", type: "time", category: "routine", timeHint: "timestamp" },
  ],

  reconstructionNodes: [
    { id: "you", label: "YOU", type: "activity" as const, weight: 1.0, x: 0, y: 0 },
    { id: "raka", label: "Raka", type: "person" as const, weight: 0.8, x: -120, y: -90 },
    { id: "lena", label: "Lena", type: "person" as const, weight: 0.75, x: 130, y: -110 },
    { id: "ethan", label: "Ethan", type: "person" as const, weight: 0.85, x: -160, y: 60 },
    { id: "office", label: "Office", type: "place" as const, weight: 0.9, x: -40, y: -140 },
    { id: "cafe", label: "Blank Street Cafe", type: "place" as const, weight: 0.95, x: 70, y: -60 },
    { id: "library", label: "Campus Library", type: "place" as const, weight: 0.7, x: -140, y: 150 },
    { id: "nextjs", label: "Next.js 16", type: "topic" as const, weight: 0.8, x: 150, y: 70 },
    { id: "algorithms", label: "Algorithms", type: "topic" as const, weight: 0.65, x: -60, y: 160 },
    { id: "invoice", label: "Client Invoice", type: "topic" as const, weight: 0.6, x: 110, y: 170 },
  ],

  reconstructionConnections: [
    { source: "you", target: "office", weight: 0.9 },
    { source: "you", target: "cafe", weight: 0.95 },
    { source: "you", target: "library", weight: 0.7 },
    { source: "you", target: "raka", weight: 0.8 },
    { source: "you", target: "lena", weight: 0.75 },
    { source: "you", target: "ethan", weight: 0.85 },
    { source: "raka", target: "cafe", weight: 0.85 },
    { source: "office", target: "you", weight: 0.9 },
    { source: "lena", target: "cafe", weight: 0.8 },
    { source: "lena", target: "nextjs", weight: 0.7 },
    { source: "ethan", target: "library", weight: 0.8 },
    { source: "library", target: "algorithms", weight: 0.75 },
    { source: "cafe", target: "invoice", weight: 0.65 },
  ],

  patterns: [
    {
      id: "pat-1",
      label: "Office / Workspace",
      category: "career",
      frequency: "5.4 days / week",
      months: [
        { month: "MAR", count: 18 },
        { month: "APR", count: 22 },
        { month: "MAY", count: 16 },
      ],
      insight: "Consistent anchor during daytime hours (10:00 - 17:30).",
    },
    {
      id: "pat-2",
      label: "Blank Street Coffee",
      category: "leisure",
      frequency: "2.8 visits / week",
      months: [
        { month: "MAR", count: 6 },
        { month: "APR", count: 11 },
        { month: "MAY", count: 9 },
      ],
      insight: "Primary evening creative workstation and social hub.",
    },
    {
      id: "pat-3",
      label: "Evening Socials",
      category: "social",
      frequency: "3.2 meetups / week",
      months: [
        { month: "MAR", count: 8 },
        { month: "APR", count: 14 },
        { month: "MAY", count: 12 },
      ],
      insight: "73% of social logs clustered between 18:30 and 22:00.",
    },
  ] as LifePattern[],

  firsts: [
    {
      id: "first-1",
      date: "17 FEB 2026",
      title: "Working from Blank Street Coffee",
      subtitle: "First recorded visit outside campus library",
      context: "Ordered iced cortado, read Next.js documentation for 2 hours.",
      category: "leisure",
    },
    {
      id: "first-2",
      date: "03 MAR 2026",
      title: "Meeting Raka after work",
      subtitle: "First spontaneous dinner meetup",
      context: "Walked down Malioboro, talked about freelance capstone direction.",
      category: "social",
    },
    {
      id: "first-3",
      date: "18 MAR 2026",
      title: "Staying at studio until 23:14",
      subtitle: "First late-night deploy session",
      context: "Pushed initial prototype before rain started.",
      category: "career",
    },
    {
      id: "first-4",
      date: "26 MAR 2026",
      title: "Sending first developer invoice",
      subtitle: "Milestone transition from coursework to client work",
      context: "Delivered landing page assets and received confirmation.",
      category: "career",
    },
  ] as FirstTimeMemory[],

  changes: [
    {
      id: "chg-1",
      periodThen: "FEBRUARY 2026",
      periodNow: "APRIL 2026",
      descriptionThen: "Routine was tightly centered around campus and home.",
      descriptionNow: "Daily radius expanded to include community hubs and studio.",
      sequenceThen: ["HOME", "LIBRARY", "HOME"],
      sequenceNow: ["HOME", "CAFE", "OFFICE", "STUDIO", "HOME"],
      evidenceText: "14 new distinct locations recorded over 8 weeks.",
    },
    {
      id: "chg-2",
      periodThen: "WEEKDAY EVENINGS (MAR)",
      periodNow: "WEEKDAY EVENINGS (APR)",
      descriptionThen: "Direct transit home after work (average departure 17:45).",
      descriptionNow: "Evenings now include more places and shared meals.",
      sequenceThen: ["OFFICE", "TRANSIT", "HOME"],
      sequenceNow: ["OFFICE", "MALIOBORO", "KENANGAN", "HOME"],
      evidenceText: "Evening away-from-home duration increased from 35m to 2h 40m.",
    },
  ] as BehaviorChange[],

  signatureInsight: {
    claim: "You visited the same café 11 times this month.",
    evidence: [
      { label: "First visit", value: "14 Feb 2026" },
      { label: "Last visit", value: "28 Mar 2026" },
      { label: "Evening tendency", value: "8 of 11 visits occurred after 18:00" },
      { label: "Shared with", value: "Raka (4x), Lena (3x), Solo (4x)" },
    ],
    reflectionQuote:
      "A place repeated becomes an anchor. Even when the days felt scattered, this table was quietly steady.",
  },

  monthReconstruction: {
    month: "MARCH 2026",
    summary:
      "A month of closing chapters and testing wings. You moved from classroom routines to client presentations and deeper evening conversations.",
    timelineEvents: [
      { date: "02 MAR", text: "Library grind with Ethan on capstone algorithms", category: "learning" },
      { date: "07 MAR", text: "Coffee with Raka discussing freelance portfolio scope", category: "social" },
      { date: "12 MAR", text: "First meeting with Lena at Blank Street Coffee", category: "social" },
      { date: "18 MAR", text: "Studio sprint until 23:14 deploying Next.js prototype", category: "career" },
      { date: "22 MAR", text: "Sunday walk through City Park, reviewing notes", category: "leisure" },
      { date: "26 MAR", text: "First developer invoice sent to landing page client", category: "career" },
      { date: "29 MAR", text: "Dinner with Ethan & Priya celebrating milestone", category: "social" },
    ],
  },
};
