import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { jobs, JOB_STATUS_LABELS, JOB_STATUS_COLORS, type JobStatus } from "@/mocks/jobs";
import { crew } from "@/mocks/crew";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs — Flyt" },
      { name: "description", content: "Planlæg flytteopgaver i kanban, kalender eller tabel." },
    ],
  }),
  component: JobsPage,
});

const STATUSES: JobStatus[] = ["planlagt", "bekraeftet", "i_gang", "afsluttet", "annulleret"];

function JobsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = jobs.filter(
    (j) =>
      j.customerName.toLowerCase().includes(search.toLowerCase()) ||
      j.number.includes(search),
  );
  const job = jobs.find((j) => j.id === selected);

  return (
    <div>
      <PageHeader
        title="Jobs"
        description={`${jobs.length} jobs · ${jobs.filter((j) => j.status === "i_gang").length} i gang`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Søg jobs…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-56 pl-8" />
            </div>
            <Button size="sm"><Plus className="h-4 w-4" /> Nyt job</Button>
          </>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
            <TabsTrigger value="table">Tabel</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-4">
            <div className="grid gap-3 lg:grid-cols-5">
              {STATUSES.map((s) => {
                const items = filtered.filter((j) => j.status === s);
                return (
                  <div key={s} className="rounded-lg bg-muted/40 p-2.5">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{JOB_STATUS_LABELS[s]}</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{items.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {items.slice(0, 8).map((j) => (
                        <Card key={j.id} onClick={() => setSelected(j.id)}
                          className="cursor-pointer p-3 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-muted-foreground">#{j.number}</span>
                            <span className="text-[10px] text-muted-foreground">{j.startTime}</span>
                          </div>
                          <div className="mt-1 font-medium text-sm">{j.customerName}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {j.origin.city} → {j.destination.city}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs">{j.volumeM3} m³</span>
                            <span className="text-xs font-semibold">{dkk(j.revenue)}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <Card className="p-5">
              <CalendarGrid />
            </Card>
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Dato</th>
                    <th className="px-4 py-2.5">Kunde</th>
                    <th className="px-4 py-2.5">Rute</th>
                    <th className="px-4 py-2.5">Crew</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Værdi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((j) => (
                    <tr key={j.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setSelected(j.id)}>
                      <td className="px-4 py-2.5 font-mono">{j.number}</td>
                      <td className="px-4 py-2.5">{j.date.toLocaleDateString("da-DK")}</td>
                      <td className="px-4 py-2.5 font-medium">{j.customerName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{j.origin.city} → {j.destination.city}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex -space-x-2">
                          {j.crewIds.slice(0, 3).map((id) => {
                            const m = crew.find((c) => c.id === id);
                            return (
                              <div key={id} className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold", m?.avatarColor)}>
                                {m?.initials}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={cn("text-[10px]", JOB_STATUS_COLORS[j.status])}>
                          {JOB_STATUS_LABELS[j.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">{dkk(j.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {job && (
            <>
              <SheetHeader>
                <SheetTitle>Job #{job.number} · {job.customerName}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3">
                    <div className="text-[11px] uppercase text-muted-foreground">Fra</div>
                    <div className="mt-1 text-sm font-medium">{job.origin.street}</div>
                    <div className="text-xs text-muted-foreground">{job.origin.zip} {job.origin.city}</div>
                    <div className="mt-1 text-[11px]">Etage {job.floorOrigin} {job.hasElevatorOrigin ? "· Elevator" : "· Ingen elevator"}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-[11px] uppercase text-muted-foreground">Til</div>
                    <div className="mt-1 text-sm font-medium">{job.destination.street}</div>
                    <div className="text-xs text-muted-foreground">{job.destination.zip} {job.destination.city}</div>
                    <div className="mt-1 text-[11px]">Etage {job.floorDest} {job.hasElevatorDest ? "· Elevator" : "· Ingen elevator"}</div>
                  </Card>
                </div>
                <Card className="p-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><div className="text-xs text-muted-foreground">Dato</div><div className="text-sm font-semibold">{job.date.toLocaleDateString("da-DK")}</div></div>
                    <div><div className="text-xs text-muted-foreground">Tid</div><div className="text-sm font-semibold">{job.startTime}</div></div>
                    <div><div className="text-xs text-muted-foreground">Volumen</div><div className="text-sm font-semibold">{job.volumeM3} m³</div></div>
                  </div>
                </Card>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Crew (træk for at omfordele)</div>
                  <div className="flex flex-wrap gap-2">
                    {job.crewIds.map((id) => {
                      const m = crew.find((c) => c.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="gap-1.5 py-1">
                          <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold", m?.avatarColor)}>{m?.initials}</span>
                          {m?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Udstyr</div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.equipment.map((e) => <Badge key={e} variant="outline">{e}</Badge>)}
                  </div>
                </div>
                {job.instructions && (
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Særlige instruktioner</div>
                    <p className="rounded-md bg-muted p-3 text-sm">{job.instructions}</p>
                  </div>
                )}
                <Card className="p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><div className="text-xs text-muted-foreground">Omsætning</div><div className="text-base font-bold">{dkk(job.revenue)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Omkostning</div><div className="text-base font-bold">{dkk(job.cost)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Margin</div><div className="text-base font-bold text-emerald-600">{dkk(job.revenue - job.cost)}</div></div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CalendarGrid() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dayJobs = (d: number) =>
    jobs.filter((j) => j.date.getMonth() === month && j.date.getDate() === d);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{firstDay.toLocaleDateString("da-DK", { month: "long", year: "numeric" })}</h3>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border text-xs">
        {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => (
          <div key={d} className="bg-muted px-2 py-1.5 font-semibold uppercase tracking-wide">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className="min-h-[88px] bg-background p-1.5">
            {d && (
              <>
                <div className={cn("text-[11px] font-semibold", d === today.getDate() && "text-primary")}>{d}</div>
                <div className="mt-1 space-y-0.5">
                  {dayJobs(d).slice(0, 2).map((j) => (
                    <div key={j.id} className={cn("truncate rounded px-1 py-0.5 text-[10px]", JOB_STATUS_COLORS[j.status])}>
                      #{j.number} {j.customerName.split(" ")[0]}
                    </div>
                  ))}
                  {dayJobs(d).length > 2 && (
                    <div className="px-1 text-[10px] text-muted-foreground">+{dayJobs(d).length - 2}</div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
