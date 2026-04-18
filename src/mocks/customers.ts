import { fullName, phone, email, randomAddress, pick, randInt, daysFromNow, DANISH_LAST_NAMES } from "./_helpers";

export type LeadSource = "Hjemmeside" | "Anbefaling" | "Google" | "Facebook" | "Trustpilot" | "Telefonopkald";
export type CustomerStage = "ny_henvendelse" | "tilbud_sendt" | "booket" | "afsluttet" | "tabt";
export type CustomerType = "privat" | "erhverv";

export const STAGE_LABELS: Record<CustomerStage, string> = {
  ny_henvendelse: "Ny henvendelse",
  tilbud_sendt: "Tilbud sendt",
  booket: "Booket",
  afsluttet: "Afsluttet",
  tabt: "Tabt",
};

export interface Communication {
  id: string;
  kind: "email" | "telefon" | "sms" | "møde";
  title: string;
  date: Date;
  summary: string;
}

export interface PreviousJobRef {
  id: string;
  number: string;
  date: Date;
  description: string;
  amount: number;
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  companyName?: string;
  cvr?: string;
  email: string;
  phone: string;
  address: { street: string; zip: string; city: string };
  stage: CustomerStage;
  source: LeadSource;
  value: number;
  createdAt: Date;
  notes: string;
  moveCount: number;
  tags: string[];
  previousJobs: PreviousJobRef[];
  communications: Communication[];
  lastJobDate?: Date;
  totalValue: number;
}

const SOURCES: LeadSource[] = ["Hjemmeside", "Anbefaling", "Google", "Facebook", "Trustpilot", "Telefonopkald"];
const STAGES: CustomerStage[] = ["ny_henvendelse", "tilbud_sendt", "booket", "afsluttet", "tabt"];
const STAGE_WEIGHTS = [10, 8, 12, 15, 5];
const TAG_OPTIONS = ["Klaver", "Pakning", "Opbevaring", "Stor flytning", "Stamkunde", "VIP"];

const COMPANY_SUFFIXES = ["ApS", "A/S", "I/S", "K/S"];
const COMPANY_PREFIXES = [
  "Nordisk", "Dansk", "Skandinavisk", "Hovedstadens", "Jysk", "Fyens",
  "Optima", "Vega", "Borealis", "Atlas", "Nova", "Aurora", "Polaris",
];
const COMPANY_TYPES = [
  "Consulting", "Advokater", "Ejendomme", "Logistik", "Group",
  "Holding", "Trading", "Solutions", "Partners", "Industries",
];

const NOTE_TEMPLATES = [
  "Ønsker pakning inkluderet. Har klaver der skal flyttes.",
  "Erhvervskunde — kontorflytning, kræver weekend.",
  "3-værelses lejlighed, 2. sal uden elevator.",
  "Skal flytte sommerhus til opmagasinering.",
  "Anbefalet af tidligere kunde. Stort hus, 220 m².",
  "Familie med 2 børn. Ønsker rolig overgang.",
  "Studerende — billig flytning, kun få ting.",
  "International flytning til Sverige planlagt.",
];

const COMM_TEMPLATES: Array<Omit<Communication, "id" | "date">> = [
  { kind: "email", title: "Tilbud sendt", summary: "Tilbud Q-30xx sendt med kalkuleret pris og servicebeskrivelse." },
  { kind: "telefon", title: "Indledende opkald", summary: "Gennemgået behov, antal m³, ønsket dato og særlige hensyn." },
  { kind: "sms", title: "Bekræftelse", summary: "SMS sendt med bekræftet flyttedato og crew-info." },
  { kind: "møde", title: "Besigtigelse", summary: "Hjemmebesøg, vurderet volumen og tilkørselsforhold." },
  { kind: "email", title: "Opfølgning", summary: "Opfølgning på sendt tilbud — afventer svar." },
];

function weightedStage(): CustomerStage {
  const total = STAGE_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = randInt(0, total - 1);
  for (let i = 0; i < STAGES.length; i++) {
    r -= STAGE_WEIGHTS[i]!;
    if (r < 0) return STAGES[i]!;
  }
  return "ny_henvendelse";
}

const PROJECT_DESCRIPTIONS = [
  "3-værelses lejlighed",
  "Villa 180 m²",
  "Kontorflytning",
  "Sommerhus",
  "Studieflytning",
  "Rækkehus",
  "Lagerflytning",
  "Klaverflytning",
];

function makePreviousJobs(count: number, baseValue: number): PreviousJobRef[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `JREF-${randInt(1000, 9999)}-${i}`,
    number: String(randInt(80, 145)),
    date: daysFromNow(-randInt(30, 800)),
    description: pick(PROJECT_DESCRIPTIONS),
    amount: baseValue + randInt(-3000, 5000),
  }));
}

function makeCommunications(count: number): Communication[] {
  return Array.from({ length: count }, (_, i) => {
    const t = pick(COMM_TEMPLATES);
    return {
      ...t,
      id: `COM-${randInt(100, 9999)}-${i}`,
      date: daysFromNow(-randInt(1, 90)),
    };
  });
}

export const customers: Customer[] = Array.from({ length: 48 }, (_, i) => {
  const type: CustomerType = i % 4 === 0 ? "erhverv" : "privat";
  const personName = fullName();
  const stage = weightedStage();
  const tagCount = randInt(0, 2);
  const tags = Array.from(new Set(Array.from({ length: tagCount }, () => pick(TAG_OPTIONS))));
  const value = randInt(4, 60) * 1000;
  const moveCount = stage === "afsluttet" ? randInt(1, 4) : randInt(0, 2);
  const previousJobs = makePreviousJobs(moveCount, value);
  const lastJobDate = previousJobs[0]?.date;
  const totalValue = previousJobs.reduce((s, p) => s + p.amount, 0) + value;

  let companyName: string | undefined;
  let cvr: string | undefined;
  let displayName = personName;
  if (type === "erhverv") {
    companyName = `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_TYPES)} ${pick(COMPANY_SUFFIXES)}`;
    cvr = String(randInt(10000000, 99999999));
    displayName = companyName;
  }

  return {
    id: `C-${String(1000 + i).padStart(4, "0")}`,
    name: displayName,
    type,
    companyName,
    cvr,
    email: type === "erhverv"
      ? `kontakt@${(companyName || "firma").toLowerCase().replace(/[^a-z]/g, "")}.dk`
      : email(personName),
    phone: phone(),
    address: randomAddress(),
    stage,
    source: pick(SOURCES),
    value,
    createdAt: daysFromNow(-randInt(1, 120)),
    notes: type === "erhverv"
      ? `Kontaktperson: ${personName} (${pick(["CFO", "Office Manager", "HR", "CEO", "Facility"])}). ${pick(NOTE_TEMPLATES)}`
      : pick(NOTE_TEMPLATES),
    moveCount,
    tags,
    previousJobs,
    communications: makeCommunications(randInt(2, 5)),
    lastJobDate,
    totalValue,
  };
});

void DANISH_LAST_NAMES;

export const customerById = (id: string) => customers.find((c) => c.id === id);
