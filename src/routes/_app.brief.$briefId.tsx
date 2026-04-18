import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Send, Clock, FileText, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { briefs as seedBriefs, type Brief, type BriefStatus } from "@/mocks/briefs";
import { useMockStore } from "@/store/mock-store";
import { todaysJobs, jobs as allJobs } from "@/mocks/jobs";
import { crew } from "@/mocks/crew";
import { vehicles } from "@/mocks/vehicles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/brief/$briefId")({
  head: () => ({
    meta: [{ title: "Brief — Movena" }],
  }),
  component: BriefDetailPage,
});

const STATUS: Record<BriefStatus, { label: string; cls: string; icon: any }> = {
  udkast: { label: "Udkast", cls: "bg-slate-100 text-slate-700 border-slate-200", icon: FileText },
  sendt: { label: "Sendt", cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Send },
  afsluttet: { label: "Afsluttet", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

function BriefDetailPage() {
  const { briefId } = Route.useParams();
  const navigate = useNavigate();
  const { briefs } = useMockStore();
  const isNew = briefId === "new";
  const existing = !isNew ? (briefs.find((b) => b.id === briefId) ?? seedBriefs.find((b) => b.id === briefId)) : undefined;

  const blank: Brief = {
    id: "new",
    date: new Date(),
    title: `Brief ${new Date().toLocaleDateString("da-DK", { day: "numeric", month: "long" })}`,
    scope: "dag",
    status: "udkast",
    author: "Anders Nielsen",
    jobsCount: todaysJobs().length || 3,
    crewCount: 4,
    vehiclesCount: 2,
    generalNotes: "",
    specialInstructions: "",
    breakSchedule: "Frokost 12:00–12:30 (alle hold).",
    announcements: "",
  };

  const brief = existing ?? blank;
  const notFound = !isNew && !existing;

  const [title, setTitle] = useState(brief.title);
  const [notes, setNotes] = useState(brief.generalNotes);
  const [special, setSpecial] = useState(brief.specialInstructions);
  const [breaks, setBreaks] = useState(brief.breakSchedule);
  const [announcements, setAnnouncements] = useState(brief.announcements);

  if (notFound) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Brief ikke fundet.</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link to="/brief">Tilbage til oversigt</Link>
        </Button>
      </div>
    );
  }

  const isToday = brief.date.getDate() === new Date().getDate() && brief.date.getMonth() === new Date().getMonth();
  const todayJ = todaysJobs();
  const sourceJobs = isToday && todayJ.length ? todayJ : allJobs.slice(0, brief.jobsCount);
  const assignedCrewIds = Array.from(new Set(sourceJobs.flatMap((j) => j.crewIds))).slice(0, brief.crewCount);
  const assignedVehicles = vehicles.slice(0, brief.vehiclesCount);
  const S = STATUS[brief.status];

  return (
    <div>
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/brief"><ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Briefs</Link>
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 w-72 border-none px-1 text-base font-semibold shadow-none focus-visible:ring-0"
            />
          </div>
          <Badge variant="outline" className={cn("gap-1 text-[11px]", S.cls)}>
            <S.icon className="h-3 w-3" strokeWidth={1.5} /> {S.label}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { toast.success("Brief gemt som udkast"); navigate({ to: "/brief" }); }}>
            <Clock className="h-4 w-4" strokeWidth={1.5} /> Gem som udkast
          </Button>
          <Button size="sm" onClick={() => { toast.success("Brief delt med crew"); navigate({ to: "/brief" }); }}>
            <Send className="h-4 w-4" strokeWidth={1.5} /> Del med crew
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[11px]">
            {brief.date.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Badge>
          <Badge variant="outline" className="text-[11px] capitalize">{brief.scope}</Badge>
          <Badge variant="outline" className="text-[11px]">af {brief.author}</Badge>
        </div>

        <Card className="border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Auto-udfyldt fra platformen
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {sourceJobs.length} jobs · {assignedCrewIds.length} crew · {assignedVehicles.length} køretøjer
          </div>
        </Card>

        <Section title="Dagens jobs">
          <div className="grid gap-2 sm:grid-cols-2">
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

        <div className="grid gap-6 md:grid-cols-2">
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
        </div>

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
      </div>
    </div>
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
