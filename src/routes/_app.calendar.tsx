import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from "@/mocks/jobs";
import { useMockStore } from "@/store/mock-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({
    meta: [
      { title: "Kalender — Flyt" },
      { name: "description", content: "Fuld kalenderoverblik over jobs og crew." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { jobs } = useMockStore();
  const navigate = useNavigate();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dayJobs = (d: number) =>
    jobs.filter((j) => j.date.getMonth() === month && j.date.getDate() === d);

  return (
    <div>
      <PageHeader title="Kalender" description="Alle jobs, crew og deadlines" actions={
        <Tabs defaultValue="month">
          <TabsList>
            <TabsTrigger value="day">Dag</TabsTrigger>
            <TabsTrigger value="week">Uge</TabsTrigger>
            <TabsTrigger value="month">Måned</TabsTrigger>
          </TabsList>
        </Tabs>
      } />
      <div className="p-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
              <h3 className="text-base font-semibold capitalize min-w-[180px]">
                {firstDay.toLocaleDateString("da-DK", { month: "long", year: "numeric" })}
              </h3>
              <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="ml-2">I dag</Button>
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
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border text-xs">
            {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => (
              <div key={d} className="bg-muted px-2 py-1.5 font-semibold uppercase tracking-wide">{d}</div>
            ))}
            {cells.map((d, i) => (
              <div key={i} className="min-h-[120px] bg-background p-2">
                {d && (
                  <>
                    <div className={cn("text-xs font-semibold", d === today.getDate() && "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground")}>{d}</div>
                    <div className="mt-1.5 space-y-1">
                      {dayJobs(d).slice(0, 3).map((j) => (
                        <button
                          key={j.id}
                          onClick={() => navigate({ to: "/jobs", search: { job: j.id } })}
                          className={cn("block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium hover:opacity-80", JOB_STATUS_COLORS[j.status])}
                        >
                          {j.startTime} #{j.number}
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
        </Card>
      </div>
    </div>
  );
}
