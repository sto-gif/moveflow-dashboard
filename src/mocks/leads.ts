import { fullName, phone, email, pick, randInt, daysFromNow, DANISH_CITIES, resetSeed } from "./_helpers";


resetSeed(1485);
export type LeadStage = "ny" | "kontaktet" | "tilbud_sendt" | "forhandling" | "vundet" | "tabt";
export type LeadSourceUI =
  | "Hjemmeside"
  | "Telefon"
  | "Anbefaling"
  | "Facebook"
  | "Google"
  | "Instagram"
  | "Trustpilot";

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  ny: "Ny",
  kontaktet: "Kontaktet",
  tilbud_sendt: "Tilbud sendt",
  forhandling: "Forhandling",
  vundet: "Vundet",
  tabt: "Tabt",
};

export const LEAD_STAGE_COLORS: Record<LeadStage, string> = {
  ny: "bg-blue-100 text-blue-700 border-blue-200",
  kontaktet: "bg-violet-100 text-violet-700 border-violet-200",
  tilbud_sendt: "bg-amber-100 text-amber-700 border-amber-200",
  forhandling: "bg-orange-100 text-orange-700 border-orange-200",
  vundet: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tabt: "bg-rose-100 text-rose-700 border-rose-200",
};

export interface Lead {
  id: string;
  name: string;
  type: "privat" | "erhverv";
  email: string;
  phone: string;
  city: string;
  stage: LeadStage;
  source: LeadSourceUI;
  estimatedValue: number;
  moveDate: Date;
  createdAt: Date;
  note: string;
  owner: string;
}

export const LEAD_SOURCES: LeadSourceUI[] = [
  "Hjemmeside", "Telefon", "Anbefaling", "Facebook", "Google", "Instagram", "Trustpilot",
];
const SOURCES = LEAD_SOURCES;
const STAGES: LeadStage[] = ["ny", "kontaktet", "tilbud_sendt", "forhandling", "vundet", "tabt"];
const STAGE_WEIGHTS = [8, 6, 5, 4, 3, 2];
const OWNERS = ["Anders N.", "Sofie P.", "Mette S.", "Kasper J."];
const NOTES = [
  "Familie i Valby — 3-vær., flytter til Hellerup.",
  "Kontorflytning, ca. 25 arbejdsstationer.",
  "Studerende — kun møblement og kasser.",
  "Stor villa, 240 m², behov for opbevaring.",
  "Klaver + tunge skabe, kræver ekstra crew.",
  "International flytning til Stockholm planlagt juni.",
  "Kun bil + 2 mand, weekend.",
  "Sommerhus til opmagasinering 6 mdr.",
];

function weightedStage(): LeadStage {
  const total = STAGE_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = randInt(0, total - 1);
  for (let i = 0; i < STAGES.length; i++) {
    r -= STAGE_WEIGHTS[i]!;
    if (r < 0) return STAGES[i]!;
  }
  return "ny";
}

// Non-round estimated values, occasionally with ,50 ører
function realisticLeadValue(i: number): number {
  const bases = [4287, 7619, 9312, 11847, 14523, 18261, 22077, 26934, 31418, 38762, 47193, 54381];
  const v = bases[i % bases.length]!;
  return i % 9 === 0 ? v + 0.5 : v;
}

export const leads: Lead[] = Array.from({ length: 32 }, (_, i) => {
  const type: "privat" | "erhverv" = i % 5 === 0 ? "erhverv" : "privat";
  const name = type === "erhverv"
    ? `${pick(["Nordisk", "Aurora", "Optima", "Vega"])} ${pick(["Group", "Solutions", "Partners"])} ApS`
    : fullName();
  return {
    id: `L-${String(5000 + i).padStart(4, "0")}`,
    name,
    type,
    email: email(type === "erhverv" ? "kontakt." + name : name),
    phone: phone(),
    city: pick(DANISH_CITIES).city,
    stage: weightedStage(),
    source: pick(SOURCES),
    estimatedValue: realisticLeadValue(i),
    moveDate: daysFromNow(randInt(3, 75)),
    createdAt: daysFromNow(-randInt(0, 30)),
    note: pick(NOTES),
    owner: pick(OWNERS),
  };
});
