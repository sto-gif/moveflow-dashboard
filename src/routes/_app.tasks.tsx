import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, LayoutGrid, Table as TableIcon, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { tasks, TASK_STATUS_LABELS, TASK_PRIORITY_COLORS, type TaskStatus, type TaskPriority } from "@/mocks/tasks";
import { crew } from "@/mocks/crew";
import { MOCK_TODAY } from "@/mocks/_helpers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [
      { title: "Opgaver — Flyt" },
      { name: "description", content: "Interne opgaver, deadlines og ansvar." },
    ],
  }),
  component: TasksPage,
});

const STATUSES: TaskStatus[] = ["todo", "i_gang", "afventer", "faerdig"];
const PRIORITIES: TaskPriority[] = ["kritisk", "hoej", "normal", "lav"];
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  kritisk: "Kritisk", hoej: "Høj", normal: "Normal", lav: "Lav",
};
const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function TasksPage() {
  const [assignee, setAssignee] = useState<string>("alle");
  const [priority, setPriority] = useState<string>("alle");
  const [due, setDue] = useState<string>("alle");

  const filtered = useMemo(() => {
    const now = MOCK_TODAY.getTime();
    return tasks.filter((t) => {
      if (assignee !== "alle" && t.assigneeId !== assignee) return false;
      if (priority !== "alle" && t.priority !== priority) return false;
      if (due !== "alle") {
        const diff = (t.dueDate.getTime() - now) / 86400000;
        if (due === "overdue" && diff >= 0) return false;
        if (due === "today" && (diff < -0.5 || diff > 0.5)) return false;
        if (due === "week" && (diff < 0 || diff > 7)) return false;
        if (due === "month" && (diff < 0 || diff > 30)) return false;
      }
      return true;
    });
  }, [assignee, priority, due]);

  return (
    <div>
      <PageHeader title="Opgaver" description={`${filtered.length} af ${tasks.length} opgaver`}
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Ny opgave</Button>} />
      <div className="p-6 space-y-4">
        <Card className="flex flex-wrap items-center gap-2 p-3">
          <Filter className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs font-medium text-muted-foreground">Filtre:</span>
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Ansvarlig" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle ansvarlige</SelectItem>
              {crew.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Prioritet" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle prioriteter</SelectItem>
              {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={due} onValueChange={setDue}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Deadline" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle deadlines</SelectItem>
              <SelectItem value="overdue">Forfaldne</SelectItem>
              <SelectItem value="today">I dag</SelectItem>
              <SelectItem value="week">Næste 7 dage</SelectItem>
              <SelectItem value="month">Næste 30 dage</SelectItem>
            </SelectContent>
          </Select>
          {(assignee !== "alle" || priority !== "alle" || due !== "alle") && (
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setAssignee("alle"); setPriority("alle"); setDue("alle"); }}>Nulstil</Button>
          )}
        </Card>

        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban"><LayoutGrid className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Kanban</TabsTrigger>
            <TabsTrigger value="table"><TableIcon className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Tabel</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarIcon className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Kalender</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban" className="mt-4">
            <div className="grid gap-3 lg:grid-cols-4">
              {STATUSES.map((s) => {
                const items = filtered.filter((t) => t.status === s);
                return (
                  <div key={s} className="rounded-lg bg-muted/40 p-2.5">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{TASK_STATUS_LABELS[s]}</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{items.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {items.map((t) => {
                        const m = crew.find((c) => c.id === t.assigneeId);
                        return (
                          <Card key={t.id} className="p-3">
                            <div className="text-sm font-medium leading-snug">{t.title}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <Badge variant="outline" className={cn("text-[10px]", TASK_PRIORITY_COLORS[t.priority])}>{PRIORITY_LABELS[t.priority]}</Badge>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">{t.dueDate.toLocaleDateString("da-DK", { day: "numeric", month: "short" })}</span>
                                <div className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold", m?.avatarColor)}>{m?.initials}</div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="table" className="mt-4">
            <Card className="max-h-[640px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">Opgave</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Prioritet</th>
                    <th className="px-4 py-2.5">Ansvarlig</th>
                    <th className="px-4 py-2.5">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const m = crew.find((c) => c.id === t.assigneeId);
                    return (
                      <tr key={t.id} className="border-t hover:bg-muted/40">
                        <td className="px-4 py-2.5 font-medium">{t.title}</td>
                        <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{TASK_STATUS_LABELS[t.status]}</Badge></td>
                        <td className="px-4 py-2.5"><Badge variant="outline" className={cn("text-[10px]", TASK_PRIORITY_COLORS[t.priority])}>{PRIORITY_LABELS[t.priority]}</Badge></td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold", m?.avatarColor)}>{m?.initials}</div>
                            <span>{t.assigneeName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">{t.dueDate.toLocaleDateString("da-DK")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            <TasksCalendar items={filtered} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TasksCalendar({ items }: { items: typeof tasks }) {
  const today = MOCK_TODAY;
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const dayTasks = (d: number) => items.filter((t) => t.dueDate.getMonth() === month && t.dueDate.getFullYear() === year && t.dueDate.getDate() === d);

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-semibold capitalize">{firstDay.toLocaleDateString("da-DK", { month: "long", year: "numeric" })} — opgaver pr. deadline</h3>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border text-xs">
        {WEEKDAYS.map((d) => <div key={d} className="bg-muted px-2 py-1.5 font-semibold uppercase tracking-wide">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className="min-h-[110px] bg-background p-1.5">
            {d && (
              <>
                <div className={cn("text-[11px] font-semibold", d === today.getDate() && "text-primary")}>{d}</div>
                <div className="mt-1 space-y-0.5">
                  {dayTasks(d).slice(0, 3).map((t) => (
                    <div key={t.id} className={cn("flex items-center gap-1 rounded px-1 py-0.5 text-[10px]", TASK_PRIORITY_COLORS[t.priority])}>
                      <div className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                  {dayTasks(d).length > 3 && <div className="text-[10px] text-muted-foreground">+{dayTasks(d).length - 3}</div>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

