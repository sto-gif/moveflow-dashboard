import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Sparkles, Send, FileText, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { briefs, type Brief, type BriefStatus } from "@/mocks/briefs";
import { todaysJobs, jobs as allJobs } from "@/mocks/jobs";
import { crew } from "@/mocks/crew";
import { vehicles } from "@/mocks/vehicles";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/brief")({
  head: () => ({
    meta: [
      { title: "Daglig Brief — Movena" },
      { name: "description", content: "Den digitale 06:00-tavle: jobs, crew, biler og noter samlet." },
    ],
  }),
  component: BriefPage,
});

const STATUS: Record<BriefStatus, { label: string; cls: string; icon: any }> = {
  udkast: { label: "Udkast", cls: "bg-slate-100 text-slate-700 border-slate-200", icon: FileText },
  sendt: { label: "Sendt", cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Send },
  afsluttet: { label: "Afsluttet", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

function BriefPage() {
  const [selected, setSelected] = useState<string | null>(briefs.find((b) => {
    const d = b.date;
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  })?.id ?? null);
  const brief = briefs.find((b) => b.id === selected);

  return (
    <div>
      <PageHeader
        title="Daglig Brief"
        description="Den digitale morgentavle — jobs, crew og biler i ét overblik."
        actions={<Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Opret ny brief</Button>}
      />
      <div className="p-6">
        <Tabs defaultValue="liste">
          <TabsList>
            <TabsTrigger value="liste">Liste</TabsTrigger>
            <TabsTrigger value="kalender">Kalender</TabsTrigger>
          </TabsList>

          <TabsContent value="liste" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">Dato</th>
                    <th className="px-4 py-2.5">Titel</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Jobs</th>
                    <th className="px-4 py-2.5">Crew</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Forfatter</th>
                  </tr>
                </thead>
                <tbody>
                  {briefs.map((b) => {
                    const S = STATUS[b.status];
                    return (
                      <tr key={b.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setSelected(b.id)}>
                        <td className="px-4 py-2.5 font-medium">
                          {b.date.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" })}
                        </td>
                        <td className="px-4 py-2.5 font-medium">{b.title}</td>
                        <td className="px-4 py-2.5 capitalize text-muted-foreground">{b.scope}</td>
                        <td className="px-4 py-2.5">{b.jobsCount}</td>
                        <td className="px-4 py-2.5">{b.crewCount}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={cn("gap-1 text-[10px]", S.cls)}>
                            <S.icon className="h-3 w-3" strokeWidth={1.5} /> {S.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{b.author}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="kalender" className="mt-4">
            <Card className="p-5">
              <BriefMonth onSelect={setSelected} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {brief && <BriefEditor brief={brief} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function BriefMonth({ onSelect }: { onSelect: (id: string) => void }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const briefForDay = (d: number) =>
    briefs.find((b) => b.date.getMonth() === month && b.date.getDate() === d);

  return (
    <div>
      <h3 className="mb-3 text-section">{firstDay.toLocaleDateString("da-DK", { month: "long", year: "numeric" })}</h3>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border text-xs">
        {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => (
          <div key={d} className="bg-muted px-2 py-1.5 font-semibold uppercase tracking-wide">{d}</div>
        ))}
        {cells.map((d, i) => {
          const b = d ? briefForDay(d) : null;
          return (
            <div key={i} className="min-h-[80px] bg-background p-1.5">
              {d && (
                <>
                  <div className={cn("text-[11px] font-semibold", d === today.getDate() && "text-primary")}>{d}</div>
                  {b && (
                    <button
                      onClick={() => onSelect(b.id)}
                      className="mt-1 w-full truncate rounded bg-primary/10 px-1 py-0.5 text-left text-[10px] text-primary hover:bg-primary/15"
                    >
                      {b.title}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BriefEditor({ brief }: { brief: Brief }) {
  const isToday = brief.date.getDate() === new Date().getDate() && brief.date.getMonth() === new Date().getMonth();
  const todayJ = todaysJobs();
  const sourceJobs = isToday && todayJ.length ? todayJ : allJobs.slice(0, brief.jobsCount);
  const assignedCrewIds = Array.from(new Set(sourceJobs.flatMap((j) => j.crewIds))).slice(0, brief.crewCount);
  const assignedVehicles = vehicles.slice(0, brief.vehiclesCount);
  const S = STATUS[brief.status];

  const [notes, setNotes] = useState(brief.generalNotes);
  const [special, setSpecial] = useState(brief.specialInstructions);
  const [breaks, setBreaks] = useState(brief.breakSchedule);
  const [announcements, setAnnouncements] = useState(brief.announcements);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
          {brief.title}
        </SheetTitle>
      </SheetHeader>
      <div className="mt-6 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("gap-1 text-[11px]", S.cls)}>
            <S.icon className="h-3 w-3" strokeWidth={1.5} /> {S.label}
          </Badge>
          <Badge variant="outline" className="text-[11px]">{brief.date.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" })}</Badge>
          <Badge variant="outline" className="text-[11px] capitalize">{brief.scope}</Badge>
          <Badge variant="outline" className="text-[11px]">af {brief.author}</Badge>
        </div>

        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            Auto-udfyldt fra platformen
          </div>
          <div className="mt-1 text-muted-foreground">
            {sourceJobs.length} jobs · {assignedCrewIds.length} crew · {assignedVehicles.length} køretøjer
          </div>
        </div>

        <Section title="Dagens jobs">
          <div className="space-y-2">
            {sourceJobs.map((j) => (
              <Card key={j.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[11px] text-muted-foreground">#{j.number}</div>
                    <div className="text-sm font-medium">{j.customerName}</div>
                    <div className="text-xs text-muted-foreground">{j.origin.city} → {j.destination.city} · {j.volumeM3} m³</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{j.startTime}</div>
                    <div className="text-[10px] text-muted-foreground">{j.crewIds.length} mand</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Crew">
          <div className="flex flex-wrap gap-1.5">
            {assignedCrewIds.map((id) => {
              const m = crew.find((c) => c.id === id);
              if (!m) return null;
              return (
                <Badge key={id} variant="secondary" className="gap-1.5 py-1">
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold", m.avatarColor)}>{m.initials}</span>
                  {m.name.split(" ")[0]}
                </Badge>
              );
            })}
          </div>
        </Section>

        <Section title="Køretøjer">
          <div className="grid grid-cols-2 gap-2">
            {assignedVehicles.map((v) => (
              <div key={v.id} className="rounded-md border p-2 text-xs">
                <div className="font-medium">{v.name}</div>
                <div className="text-muted-foreground">{v.plate} · {v.capacityM3} m³</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Generelle noter">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </Section>
        <Section title="Særlige instruktioner pr. job">
          <Textarea value={special} onChange={(e) => setSpecial(e.target.value)} rows={3} />
        </Section>
        <Section title="Pauseplan">
          <Textarea value={breaks} onChange={(e) => setBreaks(e.target.value)} rows={2} />
        </Section>
        <Section title="Meddelelser">
          <Textarea value={announcements} onChange={(e) => setAnnouncements(e.target.value)} rows={3} />
        </Section>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1"><Send className="h-4 w-4" strokeWidth={1.5} /> Del med crew</Button>
          <Button variant="outline" className="flex-1"><Clock className="h-4 w-4" strokeWidth={1.5} /> Gem som udkast</Button>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}
