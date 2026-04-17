import { fullName, phone, pick, randInt, daysFromNow } from "./_helpers";

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
  certifications: string[];
  skills: string[];
  hireDate: Date;
  avatarColor: string;
}

const ROLES: CrewRole[] = ["Chauffør", "Flyttemand", "Holdleder", "Pakker", "Lærling"];
const CERTS = ["Kørekort C", "Kørekort C+E", "Truck-cert.", "Førstehjælp", "Klaverflytning"];
const SKILLS = ["Pakning", "Tunge løft", "Møbelmontering", "Sart gods", "Kundeservice", "Engelsk"];
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
  const status: CrewStatus = i === 3 ? "ferie" : i === 7 ? "syg" : "aktiv";
  const certCount = randInt(1, 3);
  const skillCount = randInt(2, 4);
  return {
    id: `E-${String(100 + i).padStart(4, "0")}`,
    name,
    initials: `${parts[0]![0]}${parts[1]![0]}`,
    role: pick(ROLES),
    phone: phone(),
    status,
    hourlyRate: randInt(180, 320),
    hoursThisWeek: status === "aktiv" ? randInt(20, 42) : 0,
    certifications: Array.from(new Set(Array.from({ length: certCount }, () => pick(CERTS)))),
    skills: Array.from(new Set(Array.from({ length: skillCount }, () => pick(SKILLS)))),
    hireDate: daysFromNow(-randInt(60, 1800)),
    avatarColor: COLORS[i % COLORS.length]!,
  };
});

export const crewById = (id: string) => crew.find((c) => c.id === id);
