import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Phone, Calendar as CalIcon, Car, Sparkles, X, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { crew, sickCrewToday } from "@/mocks/crew";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/crew")({
  head: () => ({
    meta: [
      { title: "Vagtplan — Movena" },
      { name: "description", content: "Medarbejdere, vagter, kompetencer og sygefravær." },
    ],
  }),
  component: CrewPage,
});

const DAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function CrewPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const member = crew.find((c) => c.id === selected);
  const sick = sickCrewToday();

  const statusBadge = (status: string) => {
    const map = {
      aktiv: "bg-success/10 text-success border-success/30",
      ferie: "bg-warning/10 text-warning border-warning/30",
      syg: "bg-destructive/10 text-destructive border-destructive/30",
    } as Record<string, string>;
    return map[status] ?? "";
  };

  return (
    <div>
      <PageHeader
        title="Vagtplan"
        description={`${crew.length} medarbejdere · ${crew.filter((c) => c.status === "aktiv").length} aktive · ${sick.length} syge i dag`}
        actions={<Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Ny medarbejder</Button>}
      />
      <div className="space-y-6 p-6">
        {/* Sick today banner */}
        <Card className={cn("p-4", sick.length ? "border-destructive/30 bg-destructive/5" : "border-success/30 bg-success/5")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-full",
                sick.length ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success")}>
                {sick.length ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Check className="h-5 w-5" strokeWidth={1.5} />}
              </div>
              <div>
                <div className="text-section">{sick.length ? `${sick.length} medarbejder${sick.length > 1 ? "e" : ""} syge i dag` : "Ingen syge i dag"}</div>
                {sick.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {sick.map((s) => s.name).join(", ")}
                  </div>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline">Registrér sygefravær</Button>
          </div>
        </Card>

        {/* Crew grid */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {crew.map((c) => (
            <Card key={c.id} className="cursor-pointer p-4 hover:shadow-md transition-shadow" onClick={() => setSelected(c.id)}>
              <div className="flex items-start gap-3">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold", c.avatarColor)}>{c.initials}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{c.name}</div>
                    <Badge variant="outline" className={cn("text-[10px] capitalize", statusBadge(c.status))}>{c.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{c.role}</div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{c.hoursThisPeriod} t. denne periode</span>
                    {c.driverLicense && <Car className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.skills.slice(0, 2).map((s) => <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{s}</Badge>)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Weekly schedule */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-section">Ugeplan</h3>
            <div className="text-xs text-muted-foreground">Total timer for perioden vises pr. medarbejder</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left font-semibold w-44">Medarbejder</th>
                  {DAYS.map((d) => <th key={d} className="px-2 py-2 text-center font-semibold">{d}</th>)}
                  <th className="px-2 py-2 text-right font-semibold w-20">Total</th>
                </tr>
              </thead>
              <tbody>
                {crew.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold", c.avatarColor)}>{c.initials}</div>
                        <div>
                          <div className="font-medium">{c.name.split(" ")[0]}</div>
                          {c.sickToday && <div className="text-[9px] text-destructive font-semibold">Syg</div>}
                        </div>
                      </div>
                    </td>
                    {DAYS.map((d, i) => {
                      if (c.sickToday && i === 0) return <td key={d} className="px-1 py-1 text-center"><div className="rounded bg-destructive/10 py-1 text-[10px] text-destructive font-semibold">Syg</div></td>;
                      const off = c.status !== "aktiv" && i > 1;
                      const assigned = !off && (i + c.id.charCodeAt(2)) % 3 !== 0;
                      return (
                        <td key={d} className="px-1 py-1 text-center">
                          {off ? (
                            <div className="rounded bg-warning/10 py-1 text-[10px] text-warning">Ferie</div>
                          ) : assigned ? (
                            <div className="rounded bg-primary/10 py-1 text-[10px] font-medium text-primary">#{100 + i + c.id.charCodeAt(3) % 50}</div>
                          ) : (
                            <div className="rounded bg-muted py-1 text-[10px] text-muted-foreground">—</div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-right font-semibold tabular-nums">{c.hoursThisPeriod}t</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-section">Friønsker</h3>
          <div className="space-y-2 text-sm">
            {[
              { name: "Mette Sørensen", date: "24. apr 2025", reason: "Privat", status: "Afventer" },
              { name: "Mikkel Pedersen", date: "1.–7. maj 2025", reason: "Ferie", status: "Godkendt" },
              { name: "Ida Larsen", date: "12. apr 2025", reason: "Læge", status: "Godkendt" },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between border-b py-2 last:border-0">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.date} · {r.reason}</div>
                </div>
                <Badge variant={r.status === "Godkendt" ? "default" : "secondary"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {member && (
            <>
              <SheetHeader>
                <SheetTitle>{member.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-full text-base font-bold", member.avatarColor)}>{member.initials}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{member.role}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" strokeWidth={1.5} />{member.phone}</div>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] capitalize", statusBadge(member.status))}>{member.status}</Badge>
                </div>

                <Card className="p-3">
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div><div className="text-xs text-muted-foreground">Timeløn</div><div className="text-sm font-bold">{dkk(member.hourlyRate)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Uge</div><div className="text-sm font-bold">{member.hoursThisWeek}t</div></div>
                    <div><div className="text-xs text-muted-foreground">Periode</div><div className="text-sm font-bold">{member.hoursThisPeriod}t</div></div>
                    <div><div className="text-xs text-muted-foreground">Ansat</div><div className="text-sm font-bold flex items-center justify-center gap-1"><CalIcon className="h-3 w-3" strokeWidth={1.5} />{member.hireDate.getFullYear()}</div></div>
                  </div>
                </Card>

                <Card className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-primary" strokeWidth={1.5} />
                    <span className="font-medium">Kørekort</span>
                  </div>
                  <Badge variant={member.driverLicense ? "default" : "secondary"}>
                    {member.driverLicense ? "Ja" : "Nej"}
                  </Badge>
                </Card>

                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Certificeringer</div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.certifications.map((c) => <Badge key={c} variant="outline">{c}</Badge>)}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Kompetencer</div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" strokeWidth={1.5} /> Skill-baseret jobmatch aktiveret
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase text-success mb-2">Styrker</div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.strengths.map((s) => <Badge key={s} variant="outline" className="border-success/30 bg-success/5 text-success">{s}</Badge>)}
                  </div>
                </div>

                {member.weaknesses.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase text-warning mb-2">Udviklingsområder</div>
                    <div className="flex flex-wrap gap-1.5">
                      {member.weaknesses.map((s) => <Badge key={s} variant="outline" className="border-warning/30 bg-warning/5 text-warning">{s}</Badge>)}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Seneste jobs</div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.recentJobIds.map((id) => <Badge key={id} variant="outline" className="font-mono text-[10px]">{id}</Badge>)}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
