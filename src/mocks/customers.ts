import { fullName, phone, email, randomAddress, pick, randInt, daysFromNow } from "./_helpers";

export type LeadSource = "Hjemmeside" | "Anbefaling" | "Google" | "Facebook" | "Trustpilot" | "Telefonopkald";
export type CustomerStage = "ny_henvendelse" | "tilbud_sendt" | "booket" | "afsluttet" | "tabt";

export const STAGE_LABELS: Record<CustomerStage, string> = {
  ny_henvendelse: "Ny henvendelse",
  tilbud_sendt: "Tilbud sendt",
  booket: "Booket",
  afsluttet: "Afsluttet",
  tabt: "Tabt",
};

export interface Customer {
  id: string;
  name: string;
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
}

const SOURCES: LeadSource[] = ["Hjemmeside", "Anbefaling", "Google", "Facebook", "Trustpilot", "Telefonopkald"];
const STAGES: CustomerStage[] = ["ny_henvendelse", "tilbud_sendt", "booket", "afsluttet", "tabt"];
const STAGE_WEIGHTS = [10, 8, 12, 15, 5];
const TAG_OPTIONS = ["Privat", "Erhverv", "Klaver", "Pakning", "Opbevaring", "Stor flytning", "Stamkunde"];

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

function weightedStage(): CustomerStage {
  const total = STAGE_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = randInt(0, total - 1);
  for (let i = 0; i < STAGES.length; i++) {
    r -= STAGE_WEIGHTS[i]!;
    if (r < 0) return STAGES[i]!;
  }
  return "ny_henvendelse";
}

export const customers: Customer[] = Array.from({ length: 48 }, (_, i) => {
  const name = fullName();
  const stage = weightedStage();
  const tagCount = randInt(0, 3);
  const tags = Array.from(new Set(Array.from({ length: tagCount }, () => pick(TAG_OPTIONS))));
  return {
    id: `C-${String(1000 + i).padStart(4, "0")}`,
    name,
    email: email(name),
    phone: phone(),
    address: randomAddress(),
    stage,
    source: pick(SOURCES),
    value: randInt(4, 60) * 1000,
    createdAt: daysFromNow(-randInt(1, 120)),
    notes: pick(NOTE_TEMPLATES),
    moveCount: stage === "afsluttet" ? randInt(1, 4) : randInt(0, 2),
    tags,
  };
});

export const customerById = (id: string) => customers.find((c) => c.id === id);
