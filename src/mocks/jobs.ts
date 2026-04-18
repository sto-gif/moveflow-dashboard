import { customers } from "./customers";
import { crew } from "./crew";
import { pick, randInt, daysFromNow, randomAddress, MOCK_TODAY, resetSeed } from "./_helpers";


resetSeed(1388);
export type JobStatus = "planlagt" | "bekraeftet" | "i_gang" | "afsluttet" | "annulleret";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  planlagt: "Planlagt",
  bekraeftet: "Bekræftet",
  i_gang: "I gang",
  afsluttet: "Afsluttet",
  annulleret: "Annulleret",
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  planlagt: "bg-slate-100 text-slate-700 border-slate-200",
  bekraeftet: "bg-blue-100 text-blue-700 border-blue-200",
  i_gang: "bg-amber-100 text-amber-700 border-amber-200",
  afsluttet: "bg-emerald-100 text-emerald-700 border-emerald-200",
  annulleret: "bg-rose-100 text-rose-700 border-rose-200",
};

export interface JobPhoto {
  id: string;
  url: string;
  label: "før" | "efter";
  caption: string;
}

export interface Job {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  origin: { street: string; zip: string; city: string };
  destination: { street: string; zip: string; city: string };
  date: Date;
  startTime: string;
  estimatedHours: number;
  volumeM3: number;
  crewIds: string[];
  equipment: string[];
  instructions: string;
  status: JobStatus;
  revenue: number;
  cost: number;
  floorOrigin: number;
  floorDest: number;
  hasElevatorOrigin: boolean;
  hasElevatorDest: boolean;
  vehicleId?: string;
  photos: JobPhoto[];
}

const EQUIPMENT_OPTIONS = [
  "Flyttebil 18m³", "Flyttebil 35m³", "Sækkevogn", "Møbeltæpper",
  "Stropper", "Værktøjskasse", "Klaverdolly", "Bæreseler", "Pakkebånd",
];
const INSTRUCTIONS = [
  "Klaver skal med — bestil ekstra dolly.",
  "Smal opgang, kræver to mand på trappen.",
  "Kunden ønsker opstilling af møbler ved ankomst.",
  "Ingen elevator — vurder løft af tunge skabe.",
  "Sart porcelæn pakkes af kunden selv.",
  "Parkering i gården — koordineres med vicevært.",
  "Frokost inkluderes — book bord til crew.",
  "",
];
const TIMES = ["07:00", "07:30", "08:00", "08:30", "09:00", "10:00", "12:00", "13:00"];
const VEHICLE_IDS = ["V-001", "V-002", "V-003", "V-004", "V-006"];

const PHOTO_THUMBS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=300&fit=crop",
];

function makePhotos(status: JobStatus): JobPhoto[] {
  if (status === "planlagt" || status === "annulleret") return [];
  const count = status === "afsluttet" ? randInt(3, 6) : randInt(1, 3);
  return Array.from({ length: count }, (_, i) => {
    const label: "før" | "efter" = status === "afsluttet" && i >= Math.floor(count / 2) ? "efter" : "før";
    return {
      id: `P-${randInt(1000, 99999)}-${i}`,
      url: PHOTO_THUMBS[i % PHOTO_THUMBS.length]!,
      label,
      caption: label === "før" ? pick(["Stue", "Soveværelse", "Køkken", "Entré", "Kontor"]) : pick(["Tom stue", "Tom entré", "Færdig læsset", "Slutkontrol"]),
    };
  });
}

// Job number sequence: start at 1847 (established company), skip ~12% for cancelled/deleted gaps
function buildJobNumbers(count: number): string[] {
  const out: string[] = [];
  let n = 1847;
  const skipAt = new Set([3, 7, 12, 18, 19, 25, 31, 38, 47, 52, 58]);
  for (let i = 0; i < count; i++) {
    out.push(String(n));
    n += skipAt.has(i) ? 2 : 1;
  }
  return out;
}
const JOB_NUMBERS = buildJobNumbers(64);

// Volume buckets to create dramatic variation
function pickVolume(i: number): number {
  if (i % 32 === 5 || i % 32 === 21) return 110 + (i % 31); // commercial
  if (i % 5 === 0) return 65 + (i % 26); // villa
  if (i % 11 === 3) return 8 + (i % 5); // studio
  return 25 + (i % 16); // apartment
}

// Realistic non-round prices, occasional ,50 ører, never ends in 000/500
function realisticRevenue(volumeM3: number, i: number): number {
  const ratePool = [387, 412, 438, 467, 491, 523, 549, 576, 603];
  const rate = ratePool[i % ratePool.length]!;
  const noisePool = [173, 247, 319, 412, 587, 691, 813, 47, 129, 263];
  const noise = noisePool[(i * 3) % noisePool.length]!;
  const base = volumeM3 * rate + noise;
  if (i % 7 === 0) return base + 0.5;
  return base;
}

const NAME_OVERRIDES: Record<number, string> = {
  2: "Lars H.",
  9: "Hovedstadens Consulting ApS",
  14: "Kim P.",
  17: "Nordic Logistics & Supply Chain Group A/S",
  23: "Anne",
  31: "Skandinavisk Erhvervsejendomme Holding ApS",
  44: "Jens M.",
};

const LONG_INSTRUCTIONS = [
  "Klaver på 2. sal — bestil ekstra dolly. Smal opgang kræver to mand på trappen. Kunden vil gerne have opstilling af møbler.",
  "Kontorflytning over weekend. 25 arbejdsstationer skal demonteres fredag, opstilles søndag. Server-rum kræver særlig håndtering.",
];

export const jobs: Job[] = Array.from({ length: 64 }, (_, i) => {
  const customer = pick(customers);
  const dayOffset = randInt(-30, 30);
  const status: JobStatus =
    dayOffset < -1 ? (randInt(0, 10) > 1 ? "afsluttet" : "annulleret")
      : dayOffset === 0 ? pick(["bekraeftet", "i_gang", "i_gang"] as JobStatus[])
      : pick(["planlagt", "bekraeftet", "bekraeftet"] as JobStatus[]);
  const crewCount = randInt(2, 5);
  const crewIds = Array.from(new Set(Array.from({ length: crewCount }, () => pick(crew).id)));
  const equipCount = randInt(2, 5);
  const equipment = Array.from(new Set(Array.from({ length: equipCount }, () => pick(EQUIPMENT_OPTIONS))));
  const volumeM3 = pickVolume(i);
  const revenue = realisticRevenue(volumeM3, i);
  const cost = Math.round(revenue * (0.45 + Math.random() * 0.2)) + (i % 11);
  const instructions = i % 13 === 0 ? LONG_INSTRUCTIONS[i % 2]! : pick(INSTRUCTIONS);
  return {
    id: `J-${String(2000 + i).padStart(4, "0")}`,
    number: JOB_NUMBERS[i]!,
    customerId: customer.id,
    customerName: NAME_OVERRIDES[i] ?? customer.name,
    origin: customer.address,
    destination: randomAddress(),
    date: daysFromNow(dayOffset),
    startTime: pick(TIMES),
    estimatedHours: randInt(3, 10),
    volumeM3,
    crewIds,
    equipment,
    instructions,
    status,
    revenue,
    cost,
    floorOrigin: randInt(0, 5),
    floorDest: randInt(0, 5),
    hasElevatorOrigin: Math.random() > 0.4,
    hasElevatorDest: Math.random() > 0.4,
    vehicleId: pick(VEHICLE_IDS),
    photos: makePhotos(status),
  };
});

export const todaysJobs = () => {
  const today = MOCK_TODAY;
  return jobs.filter(
    (j) =>
      j.date.getDate() === today.getDate() &&
      j.date.getMonth() === today.getMonth() &&
      j.date.getFullYear() === today.getFullYear(),
  );
};

export const jobById = (id: string) => jobs.find((j) => j.id === id);
