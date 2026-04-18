import { crew } from "./crew";
import { pick, randInt, daysFromNow, resetSeed } from "./_helpers";


resetSeed(2067);
export type TaskStatus = "todo" | "i_gang" | "afventer" | "faerdig";
export type TaskPriority = "lav" | "normal" | "hoej" | "kritisk";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  i_gang: "I gang",
  afventer: "Afventer",
  faerdig: "Færdig",
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  lav: "bg-slate-100 text-slate-700",
  normal: "bg-blue-100 text-blue-700",
  hoej: "bg-amber-100 text-amber-700",
  kritisk: "bg-rose-100 text-rose-700",
};

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  dueDate: Date;
  description: string;
}

const TITLES = [
  "Bestil nye flyttekasser hos leverandør",
  "Opdater hjemmesidens prissektion",
  "Servicetjek af flyttebil DK 12345",
  "Ring til Lars Hansen vedr. opfølgning",
  "Indkøb af nye møbeltæpper",
  "Indberet moms for sidste kvartal",
  "Forny forsikringspolice for køretøjer",
  "Onboarding af ny medarbejder Mathias",
  "Planlæg sommerferie-rotation",
  "Opdater pakke-checkliste i håndbogen",
  "Bestil nye uniformer til crew",
  "Gennemgå Trustpilot-anmeldelser",
  "Kontakt revisor om årsregnskab",
  "Lav prisaftale med ny leverandør af tape",
  "Workshop: nye løfteteknikker",
  "Opdater Google Business-profil",
  "Test SMS-flow til kundebekræftelse",
  "Audit af lager — boks-optælling",
];

export const tasks: Task[] = TITLES.map((title, i) => {
  const member = pick(crew);
  return {
    id: `T-${String(5000 + i).padStart(4, "0")}`,
    title,
    status: pick(["todo", "todo", "i_gang", "afventer", "faerdig"] as TaskStatus[]),
    priority: pick(["lav", "normal", "normal", "hoej", "kritisk"] as TaskPriority[]),
    assigneeId: member.id,
    assigneeName: member.name,
    dueDate: daysFromNow(randInt(-3, 21)),
    description: "Intern opgave — håndteres af ansvarlig medarbejder.",
  };
});
