import { customers } from "./customers";
import { crew } from "./crew";
import { pick, randInt, daysFromNow, randomAddress, MOCK_TODAY } from "./_helpers";

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
  const volumeM3 = randInt(8, 90);
  const revenue = volumeM3 * randInt(380, 620) + randInt(0, 4000);
  const cost = Math.round(revenue * (0.45 + Math.random() * 0.2));
  return {
    id: `J-${String(2000 + i).padStart(4, "0")}`,
    number: String(100 + i),
    customerId: customer.id,
    customerName: customer.name,
    origin: customer.address,
    destination: randomAddress(),
    date: daysFromNow(dayOffset),
    startTime: pick(TIMES),
    estimatedHours: randInt(3, 10),
    volumeM3,
    crewIds,
    equipment,
    instructions: pick(INSTRUCTIONS),
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
