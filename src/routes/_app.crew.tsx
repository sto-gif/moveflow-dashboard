import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Phone, Calendar as CalIcon, Car, Sparkles, X, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const [calRange, setCalRange] = useState<"day" | "week" | "month">("week");
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
      <div className="space-y-4 p-6">
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

        <Tabs defaultValue="tabel">
          <TabsList>
            <TabsTrigger value="tabel">Tabel</TabsTrigger>
            <TabsTrigger value="kalender">Kalender</TabsTrigger>
          </TabsList>

          <TabsContent value="tabel" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Navn</th>
                    <th className="px-4 py-2.5 font-medium">Rolle</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Tildelte jobs</th>
                    <th className="px-4 py-2.5 font-medium">Timer</th>
                    <th className="px-4 py-2.5 font-medium">Skills & cert.</th>
                  </tr>
                </thead>
                <tbody>
                  {crew.map((c) => (
                    <tr key={c.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setSelected(c.id)}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold", c.avatarColor)}>{c.initials}</div>
                          <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-[10px] text-muted-foreground">{c.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.role}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={cn("text-[10px] capitalize", statusBadge(c.status))}>{c.status}</Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {c.recentJobIds.slice(0, 3).map((id) => <Badge key={id} variant="outline" className="font-mono text-[9px]">{id}</Badge>)}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-semibold tabular-nums">{c.hoursThisPeriod}t</td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.skills.slice(0, 2).map((s) => <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{s}</Badge>)}
                          {c.certifications.slice(0, 1).map((s) => <Badge key={s} variant="outline" className="text-[9px] px-1.5 py-0">{s}</Badge>)}
                          {c.driverLicense && <Car className="h-3 w-3 text-primary" strokeWidth={1.5} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="kalender" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border p-0.5">
                {(["day", "week", "month"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setCalRange(r)}
                    className={cn(
                      "rounded px-3 py-1 text-xs font-medium",
                      calRange === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {r === "day" ? "Dag" : r === "week" ? "Uge" : "Måned"}
                  </button>
                ))}
              </div>
            </div>

            {calRange === "day" && (
              <Card className="p-5">
                <h3 className="text-section mb-3">I dag</h3>
                <div className="space-y-2">
                  {crew.filter((c) => !c.sickToday && c.status === "aktiv").map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-md border p-2.5">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold", c.avatarColor)}>{c.initials}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground">{c.role}</div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">
                        Job #{100 + c.id.charCodeAt(2) % 50}
                      </Badge>
                      <span className="text-xs text-muted-foreground tabular-nums">08:00–16:00</span>
                    </div>
                  ))}
                  {crew.filter((c) => c.sickToday).map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-2.5">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold", c.avatarColor)}>{c.initials}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-[10px] text-destructive">Syg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {calRange === "week" && (
              <Card className="p-5">
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
            )}

            {calRange === "month" && (
              <Card className="p-5">
                <h3 className="text-section mb-3">April 2025</h3>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {DAYS.map((d) => <div key={d} className="text-center font-semibold text-muted-foreground py-1">{d}</div>)}
                  {Array.from({ length: 30 }).map((_, i) => {
                    const assignedCount = (i * 3) % crew.length;
                    return (
                      <div key={i} className="aspect-square rounded border p-1.5 hover:bg-muted/40 cursor-pointer">
                        <div className="text-[10px] font-semibold">{i + 1}</div>
                        <div className="mt-1 space-y-0.5">
                          {crew.slice(0, assignedCount % 3).map((c) => (
                            <div key={c.id} className={cn("h-1 rounded-full", c.avatarColor.split(" ")[0])} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

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
