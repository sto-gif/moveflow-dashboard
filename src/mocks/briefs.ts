import { daysFromNow, randInt, pick, resetSeed } from "./_helpers";


resetSeed(1000);
export type BriefStatus = "udkast" | "sendt" | "afsluttet";
export type BriefScope = "dag" | "uge" | "måned";

export interface Brief {
  id: string;
  title: string;
  date: Date;
  scope: BriefScope;
  status: BriefStatus;
  author: string;
  jobsCount: number;
  crewCount: number;
  vehiclesCount: number;
  generalNotes: string;
  specialInstructions: string;
  breakSchedule: string;
  announcements: string;
}

const AUTHORS = ["Anders Nielsen", "Mette Sørensen", "Sofie Pedersen"];
const TITLE_TEMPLATES = [
  "Daglig morgenbrief",
  "Ugentlig planlægning",
  "Månedlig status",
  "Lørdagsbrief",
  "Weekend-koordinering",
];

export const briefs: Brief[] = Array.from({ length: 14 }, (_, i) => {
  const dayOffset = i === 0 ? 0 : -i * 2 + (i % 2);
  const scope: BriefScope = i % 6 === 0 ? "uge" : i % 12 === 0 ? "måned" : "dag";
  const status: BriefStatus = dayOffset > 0 ? "udkast" : dayOffset === 0 ? "sendt" : "afsluttet";
  const date = daysFromNow(dayOffset);
  const jobsCount = randInt(2, 7);
  const crewCount = randInt(4, 12);
  const sick = randInt(0, 2);
  const dayShort = date.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" });
  const weekNo = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7) + date.getMonth() * 4;
  const teamLabel = sick === 0 ? "fuldt team" : `${sick} syge`;
  const title =
    scope === "dag" ? `${dayShort}: ${jobsCount} jobs, ${teamLabel}`
    : scope === "uge" ? `Uge ${weekNo}: ${jobsCount * 5} jobs, ${teamLabel}`
    : `${date.toLocaleDateString("da-DK", { month: "long" })}: månedlig status`;
  return {
    id: `B-${String(8000 + i).padStart(4, "0")}`,
    title,
    date,
    scope,
    status,
    author: pick(AUTHORS),
    jobsCount,
    crewCount,
    vehiclesCount: randInt(2, 4),
    generalNotes:
      "Husk at notere skader på køretøjer ved hjemkomst. Kunder skal kontaktes 30 min. før ankomst.",
    specialInstructions:
      "Job #142: klaver — brug klaverdolly. Job #144: smal opgang, ekstra hjælp på trappen.",
    breakSchedule: "Frokost 11:30–12:00. Eftermiddagspause 14:30 (15 min).",
    announcements:
      "Velkommen til ny lærling Magnus, han følger Lars i denne uge. Husk MUS-samtaler er på fredag.",
  };
});

export const briefById = (id: string) => briefs.find((b) => b.id === id);

void TITLE_TEMPLATES;
