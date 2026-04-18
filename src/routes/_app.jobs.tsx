import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Image as ImageIcon, Upload, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { jobs, JOB_STATUS_LABELS, JOB_STATUS_COLORS, type JobStatus, type Job } from "@/mocks/jobs";
import { crew } from "@/mocks/crew";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs — Movena" },
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
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <Input placeholder="Søg jobs…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-56 pl-8" />
            </div>
            <Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Nyt job</Button>
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
            <Card className="p-5"><CalendarGrid /></Card>
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
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {job && <JobSheet job={job} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function JobSheet({ job }: { job: Job }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Job #{job.number} · {job.customerName}</SheetTitle>
      </SheetHeader>
      <Tabs defaultValue="detaljer" className="mt-6">
        <TabsList>
          <TabsTrigger value="detaljer">Detaljer</TabsTrigger>
          <TabsTrigger value="fotos">
            <ImageIcon className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Fotos ({job.photos.length})
          </TabsTrigger>
          <TabsTrigger value="okonomi">Økonomi</TabsTrigger>
        </TabsList>

        <TabsContent value="detaljer" className="mt-4 space-y-4">
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
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Crew</div>
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
        </TabsContent>

        <TabsContent value="fotos" className="mt-4 space-y-4">
          <Card className="border-dashed border-2 p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <div className="mt-2 text-sm font-medium">Træk fotos hertil eller klik for at uploade</div>
            <div className="mt-1 text-xs text-muted-foreground">JPG, PNG · Crew kan også uploade direkte fra mobilappen</div>
            <Button size="sm" variant="outline" className="mt-3"><Camera className="h-4 w-4" strokeWidth={1.5} /> Vælg billeder</Button>
          </Card>

          {(["før", "efter"] as const).map((label) => {
            const photos = job.photos.filter((p) => p.label === label);
            if (photos.length === 0) return null;
            return (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">{label === "før" ? "Før flytning" : "Efter flytning"}</div>
                  <Badge variant="secondary" className="text-[10px]">{photos.length}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p) => (
                    <div key={p.id} className="group relative overflow-hidden rounded-md border bg-muted">
                      <img src={p.url} alt={p.caption} className="aspect-square w-full object-cover" loading="lazy" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <div className="text-[10px] font-medium text-white">{p.caption}</div>
                      </div>
                      <Badge className={cn("absolute left-1.5 top-1.5 text-[9px]", label === "før" ? "bg-blue-600" : "bg-emerald-600")}>
                        {label.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {job.photos.length === 0 && (
            <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              Ingen fotos uploadet endnu.
            </div>
          )}
        </TabsContent>

        <TabsContent value="okonomi" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><div className="text-xs text-muted-foreground">Omsætning</div><div className="text-base font-bold">{dkk(job.revenue)}</div></div>
              <div><div className="text-xs text-muted-foreground">Omkostning</div><div className="text-base font-bold">{dkk(job.cost)}</div></div>
              <div><div className="text-xs text-muted-foreground">Margin</div><div className="text-base font-bold text-success">{dkk(job.revenue - job.cost)}</div></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Margin %</div>
            <div className="mt-1 text-2xl font-bold">{(((job.revenue - job.cost) / job.revenue) * 100).toFixed(1)}%</div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function CalendarGrid() {
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
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-section">{firstDay.toLocaleDateString("da-DK", { month: "long", year: "numeric" })}</h3>
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
