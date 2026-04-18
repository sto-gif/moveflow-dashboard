import { fullName, phone, pick, randInt, daysFromNow, resetSeed } from "./_helpers";


resetSeed(1097);
export type CrewRole = "Chauffør" | "Flyttemand" | "Holdleder" | "Pakker" | "Lærling";
export type CrewStatus = "aktiv" | "ferie" | "syg";

export interface CrewMember {
  id: string;
  name: string;
  initials: string;
  role: CrewRole;
  phone: string;
  status: CrewStatus;
  hourlyRate: number;
  hoursThisWeek: number;
  hoursThisPeriod: number;
  certifications: string[];
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  driverLicense: boolean;
  hireDate: Date;
  avatarColor: string;
  recentJobIds: string[];
  sickToday: boolean;
}

const ROLES: CrewRole[] = ["Chauffør", "Flyttemand", "Holdleder", "Pakker", "Lærling"];
const CERTS = ["Kørekort C", "Kørekort C+E", "Truck-cert.", "Førstehjælp", "Klaverflytning", "ADR-bevis"];
const SKILLS = ["Pakning", "Tunge løft", "Møbelmontering", "Sart gods", "Kundeservice", "Engelsk"];
const STRENGTHS = [
  "Holdspiller", "Effektiv", "Detaljeorienteret", "God kundekontakt",
  "Erfaren chauffør", "Stærk fysik", "Pålidelig", "Initiativrig",
];
const WEAKNESSES = [
  "Ny på området", "Begrænset engelsk", "Undgår tunge løft",
  "Skal lære lastsikring", "Behøver supervision", "Tidskrævende ved pakning",
];
const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

export const crew: CrewMember[] = Array.from({ length: 15 }, (_, i) => {
  const name = fullName();
  const parts = name.split(" ");
  const status: CrewStatus = i === 3 ? "ferie" : i === 7 || i === 11 ? "syg" : "aktiv";
  const certCount = randInt(1, 3);
  const skillCount = randInt(2, 4);
  const strengthCount = randInt(2, 3);
  const weaknessCount = randInt(0, 2);
  const role = pick(ROLES);
  const recentJobIds = Array.from({ length: randInt(2, 5) }, () => `J-${randInt(2000, 2063)}`);
  return {
    id: `E-${String(100 + i).padStart(4, "0")}`,
    name,
    initials: `${parts[0]![0]}${parts[1]![0]}`,
    role,
    phone: phone(),
    status,
    hourlyRate: randInt(180, 320),
    hoursThisWeek: status === "aktiv" ? randInt(20, 42) : 0,
    hoursThisPeriod: status === "aktiv" ? randInt(80, 168) : randInt(0, 40),
    certifications: Array.from(new Set(Array.from({ length: certCount }, () => pick(CERTS)))),
    skills: Array.from(new Set(Array.from({ length: skillCount }, () => pick(SKILLS)))),
    strengths: Array.from(new Set(Array.from({ length: strengthCount }, () => pick(STRENGTHS)))),
    weaknesses: Array.from(new Set(Array.from({ length: weaknessCount }, () => pick(WEAKNESSES)))),
    driverLicense: role === "Chauffør" || role === "Holdleder" || randInt(0, 10) > 4,
    hireDate: daysFromNow(-randInt(60, 1800)),
    avatarColor: COLORS[i % COLORS.length]!,
    recentJobIds,
    sickToday: status === "syg",
  };
});

export const crewById = (id: string) => crew.find((c) => c.id === id);
export const sickCrewToday = () => crew.filter((c) => c.sickToday);
