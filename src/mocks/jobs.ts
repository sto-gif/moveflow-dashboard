import { customers } from "./customers";
import { crew } from "./crew";
import { pick, randInt, daysFromNow, randomAddress } from "./_helpers";

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
  };
});

export const todaysJobs = () => {
  const today = new Date();
  return jobs.filter(
    (j) =>
      j.date.getDate() === today.getDate() &&
      j.date.getMonth() === today.getMonth() &&
      j.date.getFullYear() === today.getFullYear(),
  );
};

export const jobById = (id: string) => jobs.find((j) => j.id === id);
