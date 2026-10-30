export const CATEGORIES = [
  "Road Damage",
  "Waste Management",
  "Drainage",
  "Streetlight",
  "Water Supply",
  "Waterlogging",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["Pending", "In Progress", "Resolved"] as const;
export type Status = (typeof STATUSES)[number];

export const TEAMS = [
  "Unassigned",
  "Roads & Infrastructure",
  "Sanitation Department",
  "Drainage & Sewerage",
  "Electrical Maintenance",
  "Water Board",
] as const;
export type Team = (typeof TEAMS)[number];

export interface HistoryEntry {
  date: string;
  status: Status;
  note: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  image?: string;
  createdAt: string;
  status: Status;
  team: Team;
  history: HistoryEntry[];
}

const KEY = "civicai.complaints.v1";

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const SEED: Complaint[] = [
  {
    id: "CIV-1001",
    title: "Large pothole near bus stop",
    description:
      "A deep pothole has formed right in front of the MG Road bus stop. Two-wheelers are swerving dangerously and one rider fell yesterday. It fills with water when it rains.",
    category: "Road Damage",
    location: "MG Road, Ward 12",
    createdAt: d(6),
    status: "In Progress",
    team: "Roads & Infrastructure",
    history: [
      { date: d(6), status: "Pending", note: "Complaint received." },
      { date: d(4), status: "In Progress", note: "Assigned to Roads & Infrastructure. Site inspection done." },
    ],
  },
  {
    id: "CIV-1002",
    title: "Garbage not collected for a week",
    description:
      "Garbage bins at the Shivaji Nagar market corner have not been emptied for 7 days. Smell is unbearable and stray dogs are spreading waste on the street.",
    category: "Waste Management",
    location: "Shivaji Nagar Market, Ward 8",
    createdAt: d(3),
    status: "Pending",
    team: "Unassigned",
    history: [{ date: d(3), status: "Pending", note: "Complaint received." }],
  },
  {
    id: "CIV-1003",
    title: "Streetlights off on entire lane",
    description:
      "All streetlights on Lane 4 have been off for 10 days. The lane is completely dark at night and residents, especially women and children, feel unsafe.",
    category: "Streetlight",
    location: "Lane 4, Kothrud, Ward 21",
    createdAt: d(10),
    status: "Resolved",
    team: "Electrical Maintenance",
    history: [
      { date: d(10), status: "Pending", note: "Complaint received." },
      { date: d(8), status: "In Progress", note: "Electrical team dispatched." },
      { date: d(5), status: "Resolved", note: "Faulty cable replaced. All 9 lights working." },
    ],
  },
  {
    id: "CIV-1004",
    title: "Blocked drain overflowing",
    description:
      "The drain outside Sai Apartments is blocked and sewage water is overflowing onto the road. Risk of disease spreading in the area.",
    category: "Drainage",
    location: "Sai Apartments, Baner, Ward 9",
    createdAt: d(2),
    status: "Pending",
    team: "Unassigned",
    history: [{ date: d(2), status: "Pending", note: "Complaint received." }],
  },
  {
    id: "CIV-1005",
    title: "No water supply since two days",
    description:
      "Our entire society has had no water supply for 2 days. Elderly residents are struggling. No notice was given.",
    category: "Water Supply",
    location: "Green Park Society, Ward 15",
    createdAt: d(1),
    status: "In Progress",
    team: "Water Board",
    history: [
      { date: d(1), status: "Pending", note: "Complaint received." },
      { date: d(0.5), status: "In Progress", note: "Pipeline leak identified, repair underway." },
    ],
  },
  {
    id: "CIV-1006",
    title: "Road flooded after rain",
    description:
      "Every time it rains the underpass gets waterlogged knee-deep. Vehicles are getting stuck and the road becomes unusable.",
    category: "Waterlogging",
    location: "MG Road Underpass, Ward 12",
    createdAt: d(5),
    status: "Pending",
    team: "Unassigned",
    history: [{ date: d(5), status: "Pending", note: "Complaint received." }],
  },
  {
    id: "CIV-1007",
    title: "Pothole at MG Road signal",
    description: "Another big pothole near the MG Road traffic signal, dangerous for bikes.",
    category: "Road Damage",
    location: "MG Road Signal, Ward 12",
    createdAt: d(2),
    status: "Pending",
    team: "Unassigned",
    history: [{ date: d(2), status: "Pending", note: "Complaint received." }],
  },
];

export function loadComplaints(): Complaint[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as Complaint[];
  } catch {
    return SEED;
  }
}

/** Returns true only if the write actually succeeded. */
export function saveComplaints(list: Complaint[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return JSON.parse(localStorage.getItem(KEY) ?? "[]").length === list.length;
  } catch {
    return false;
  }
}

export function nextId(list: Complaint[]): string {
  const max = list.reduce((m, c) => Math.max(m, parseInt(c.id.split("-")[1]) || 1000), 1000);
  return `CIV-${max + 1}`;
}

export function stats(list: Complaint[]) {
  return {
    total: list.length,
    pending: list.filter((c) => c.status === "Pending").length,
    inProgress: list.filter((c) => c.status === "In Progress").length,
    resolved: list.filter((c) => c.status === "Resolved").length,
  };
}

/* ---------- Rule-based analysis (no AI connected yet) ---------- */

const KEYWORDS: Record<Exclude<Category, "Other">, string[]> = {
  "Road Damage": ["pothole", "road", "crack", "footpath", "asphalt"],
  "Waste Management": ["garbage", "waste", "trash", "bin", "litter", "dump"],
  Drainage: ["drain", "sewage", "sewer", "gutter", "manhole"],
  Streetlight: ["streetlight", "street light", "light", "lamp", "dark"],
  "Water Supply": ["water supply", "no water", "tap", "pipeline", "pipe"],
  Waterlogging: ["flood", "waterlog", "rain", "knee-deep", "stagnant"],
};

const URGENT = ["danger", "accident", "fell", "injur", "unsafe", "disease", "elderly", "children", "sewage", "overflow", "fire", "electric"];

const ACTIONS: Record<Category, { team: Team; action: string }> = {
  "Road Damage": { team: "Roads & Infrastructure", action: "Send road crew to inspect and fill the pothole; place warning signs meanwhile." },
  "Waste Management": { team: "Sanitation Department", action: "Schedule immediate garbage pickup and review the collection route." },
  Drainage: { team: "Drainage & Sewerage", action: "Dispatch a de-silting team to clear the blockage and sanitise the area." },
  Streetlight: { team: "Electrical Maintenance", action: "Send an electrician to check wiring and replace faulty lamps." },
  "Water Supply": { team: "Water Board", action: "Check pipeline pressure and leaks; arrange a water tanker if repair is delayed." },
  Waterlogging: { team: "Drainage & Sewerage", action: "Clear storm-water drains and deploy pumps during heavy rain." },
  Other: { team: "Unassigned", action: "Review manually and route to the right department." },
};

const tokens = (s: string) =>
  new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3));

export function analyze(c: Complaint, all: Complaint[]) {
  const text = `${c.title} ${c.description}`.toLowerCase();

  let detected: Category = "Other";
  let best = 0;
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    const hits = words.filter((w) => text.includes(w)).length;
    if (hits > best) {
      best = hits;
      detected = cat as Category;
    }
  }

  const reasons: string[] = [];
  let score = 30;
  const urgentHits = URGENT.filter((w) => text.includes(w));
  if (urgentHits.length) {
    score += Math.min(35, urgentHits.length * 12);
    reasons.push(`mentions safety/health risk (${urgentHits.join(", ")})`);
  }
  const days = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000);
  const dayMatch = text.match(/(\d+)\s*(day|week)/);
  const ongoing = dayMatch ? parseInt(dayMatch[1]) * (dayMatch[2] === "week" ? 7 : 1) : 0;
  if (ongoing >= 3) {
    score += 10;
    reasons.push(`problem ongoing for ${ongoing}+ days`);
  }
  if (days >= 5 && c.status !== "Resolved") {
    score += 10;
    reasons.push(`open for ${days} days`);
  }

  const mine = tokens(`${c.title} ${c.location}`);
  const duplicates = all
    .filter((o) => o.id !== c.id && o.category === c.category)
    .map((o) => {
      const theirs = tokens(`${o.title} ${o.location}`);
      const overlap = [...mine].filter((w) => theirs.has(w)).length;
      return { complaint: o, overlap };
    })
    .filter((x) => x.overlap >= 2)
    .map((x) => x.complaint);
  if (duplicates.length) {
    score += Math.min(15, duplicates.length * 8);
    reasons.push(`${duplicates.length} similar report(s) nearby`);
  }
  score = Math.max(0, Math.min(100, score));
  const level = score >= 70 ? "High" : score >= 45 ? "Medium" : "Low";

  const firstSentence = c.description.split(/(?<=[.!?])\s/)[0];
  const summary = `${detected} issue at ${c.location}: ${firstSentence}`;

  return {
    summary,
    detected,
    score,
    level: level as "High" | "Medium" | "Low",
    explanation: reasons.length
      ? `Score raised because it ${reasons.join("; ")}.`
      : "No urgent signals found; standard priority.",
    duplicates,
    ...ACTIONS[detected],
  };
}

export function hotspots(list: Complaint[]) {
  const map = new Map<string, number>();
  for (const c of list) {
    const ward = c.location.match(/ward\s*\d+/i)?.[0] ?? c.location.split(",")[0];
    map.set(ward, (map.get(ward) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}
