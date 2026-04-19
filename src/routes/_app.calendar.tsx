import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Sun, CalendarRange, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from "@/mocks/jobs";
import { useMockStore } from "@/store/mock-store";
import { MOCK_TODAY } from "@/mocks/_helpers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({
    meta: [
      { title: "Kalender — Movena" },
      { name: "description", content: "Fuld kalenderoverblik over jobs og crew." },
    ],
  }),
  component: CalendarPage,
});

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 00-23
const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function CalendarPage() {
  const { jobs } = useMockStore();
  const navigate = useNavigate();
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [cursor, setCursor] = useState<Date>(new Date(MOCK_TODAY));

  const shift = (n: number) => {
    const d = new Date(cursor);
    if (view === "day") d.setDate(d.getDate() + n);
    else if (view === "week") d.setDate(d.getDate() + n * 7);
    else d.setMonth(d.getMonth() + n);
    setCursor(d);
  };
  const today = () => setCursor(new Date(MOCK_TODAY));

  const label = () => {
    if (view === "day") return cursor.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (view === "week") {
      const start = startOfWeek(cursor);
      const end = new Date(start); end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("da-DK", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return cursor.toLocaleDateString("da-DK", { month: "long", year: "numeric" });
  };

  const jobLabel = (j: { number: string; customerName: string; startTime: string }) =>
    `${j.startTime} #${j.number} ${j.customerName.split(" ")[0]}`;

  return (
    <div>
      <PageHeader title="Kalender" description="Alle jobs, crew og deadlines" actions={
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="day"><Sun className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Dag</TabsTrigger>
            <TabsTrigger value="week"><CalendarRange className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Uge</TabsTrigger>
            <TabsTrigger value="month"><CalendarDays className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Måned</TabsTrigger>
          </TabsList>
        </Tabs>
      } />
      <div className="p-6">
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <h3 className="text-base font-semibold capitalize min-w-[220px]">{label()}</h3>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="ml-2" onClick={today}>I dag</Button>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {(["planlagt", "bekraeftet", "i_gang", "afsluttet", "annulleret"] as const).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={cn("h-2.5 w-2.5 rounded-sm", JOB_STATUS_COLORS[s])} />
                  {JOB_STATUS_LABELS[s]}
                </div>
              ))}
            </div>
          </div>

          {view === "month" && <MonthGrid cursor={cursor} jobs={jobs} onJobClick={(id) => navigate({ to: "/jobs", search: { job: id } })} jobLabel={jobLabel} />}
          {view === "week" && <WeekGrid cursor={cursor} jobs={jobs} onJobClick={(id) => navigate({ to: "/jobs", search: { job: id } })} />}
          {view === "day" && <DayGrid cursor={cursor} jobs={jobs} onJobClick={(id) => navigate({ to: "/jobs", search: { job: id } })} />}
        </Card>
      </div>
    </div>
  );
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function MonthGrid({ cursor, jobs, onJobClick, jobLabel }: { cursor: Date; jobs: any[]; onJobClick: (id: string) => void; jobLabel: (j: any) => string }) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const dayJobs = (d: number) => jobs.filter((j) => j.date.getMonth() === month && j.date.getFullYear() === year && j.date.getDate() === d);
  const todayDay = isSameDay(MOCK_TODAY, cursor) || (MOCK_TODAY.getMonth() === month && MOCK_TODAY.getFullYear() === year) ? MOCK_TODAY.getDate() : -1;

  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border text-xs">
      {WEEKDAYS.map((d) => (
        <div key={d} className="bg-muted px-2 py-1.5 font-semibold uppercase tracking-wide">{d}</div>
      ))}
      {cells.map((d, i) => (
        <div key={i} className="min-h-[120px] bg-background p-2">
          {d && (
            <>
              <div className={cn("text-xs font-semibold", d === todayDay && "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground")}>{d}</div>
              <div className="mt-1.5 space-y-1">
                {dayJobs(d).slice(0, 3).map((j) => (
                  <button
                    key={j.id}
                    onClick={() => onJobClick(j.id)}
                    className={cn("block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium hover:opacity-80", JOB_STATUS_COLORS[j.status as keyof typeof JOB_STATUS_COLORS])}
                    title={`${j.customerName} — ${j.origin.city} → ${j.destination.city}`}
                  >
                    {jobLabel(j)}
                  </button>
                ))}
                {dayJobs(d).length > 3 && (
                  <div className="px-1 text-[10px] text-muted-foreground">+{dayJobs(d).length - 3} mere</div>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function WeekGrid({ cursor, jobs, onJobClick }: { cursor: Date; jobs: any[]; onJobClick: (id: string) => void }) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(d.getDate() + i); return d;
  });

  return (
    <div className="max-h-[600px] overflow-auto">
      <div className="grid min-w-[800px]" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
        <div />
        {days.map((d) => (
          <div key={d.toISOString()} className={cn("border-b border-l px-2 py-1.5 text-center", isSameDay(d, MOCK_TODAY) && "bg-primary/5")}>
            <div className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground">{WEEKDAYS[(d.getDay() + 6) % 7]}</div>
            <div className={cn("text-sm font-semibold", isSameDay(d, MOCK_TODAY) && "text-primary")}>{d.getDate()}</div>
          </div>
        ))}
        {HOURS.map((h) => (
          <>
            <div key={`hour-${h}`} className="border-t pr-2 pt-1 text-right text-[10px] tabular-nums text-muted-foreground">{String(h).padStart(2, "0")}:00</div>
            {days.map((d) => {
              const cellJobs = jobs.filter((j) => isSameDay(j.date, d) && parseInt(j.startTime.split(":")[0], 10) === h);
              return (
                <div key={`${d.toISOString()}-${h}`} className="min-h-[44px] border-l border-t p-0.5">
                  {cellJobs.map((j) => (
                    <button
                      key={j.id}
                      onClick={() => onJobClick(j.id)}
                      className={cn("mb-0.5 block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium hover:opacity-80", JOB_STATUS_COLORS[j.status as keyof typeof JOB_STATUS_COLORS])}
                      title={`${j.customerName} — ${j.origin.city} → ${j.destination.city}`}
                    >
                      {j.startTime} #{j.number} {j.customerName.split(" ")[0]}
                    </button>
                  ))}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function DayGrid({ cursor, jobs, onJobClick }: { cursor: Date; jobs: any[]; onJobClick: (id: string) => void }) {
  const dayJobs = jobs.filter((j) => isSameDay(j.date, cursor));
  return (
    <div className="max-h-[600px] overflow-auto">
    <div className="grid" style={{ gridTemplateColumns: "70px 1fr" }}>
      {HOURS.map((h) => {
        const cellJobs = dayJobs.filter((j) => parseInt(j.startTime.split(":")[0], 10) === h);
        return (
          <>
            <div key={`h-${h}`} className="border-t pr-2 pt-2 text-right text-xs tabular-nums text-muted-foreground">{String(h).padStart(2, "0")}:00</div>
            <div key={`c-${h}`} className="min-h-[60px] border-l border-t p-1.5">
              {cellJobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => onJobClick(j.id)}
                  className={cn("mb-1 block w-full rounded px-2 py-1 text-left text-xs font-medium hover:opacity-80", JOB_STATUS_COLORS[j.status as keyof typeof JOB_STATUS_COLORS])}
                >
                  <div className="font-semibold">{j.startTime} · #{j.number} · {j.customerName}</div>
                  <div className="text-[10px] opacity-80">{j.origin.city} → {j.destination.city} · {j.volumeM3} m³</div>
                </button>
              ))}
              {cellJobs.length === 0 && <div className="h-full" />}
            </div>
          </>
        );
      })}
    </div>
    </div>
  );
}
