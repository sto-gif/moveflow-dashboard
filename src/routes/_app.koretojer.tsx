import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Truck, Wrench, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { vehicles, vehicleAssignments, type VehicleStatus } from "@/mocks/vehicles";
import { number } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/koretojer")({
  head: () => ({
    meta: [
      { title: "Køretøjer — Movena" },
      { name: "description", content: "Vognpark og kapacitetsplanlægning." },
    ],
  }),
  component: VehiclesPage,
});

const STATUS_COLORS: Record<VehicleStatus, string> = {
  tilgaengelig: "bg-emerald-100 text-emerald-700 border-emerald-200",
  i_brug: "bg-blue-100 text-blue-700 border-blue-200",
  service: "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
  tilgaengelig: "Tilgængelig",
  i_brug: "I brug",
  service: "På værksted",
};

const DAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function VehiclesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const v = vehicles.find((x) => x.id === selected);
  const totalCapacity = vehicles.reduce((s, x) => s + x.capacityM3, 0);
  const inService = vehicles.filter((x) => x.status === "service").length;

  return (
    <div>
      <PageHeader
        title="Køretøjer"
        description={`${vehicles.length} køretøjer · ${totalCapacity} m³ samlet kapacitet · ${inService} på værksted`}
        actions={<Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Nyt køretøj</Button>}
      />
      <div className="space-y-4 p-6">
        <Tabs defaultValue="tabel">
          <TabsList>
            <TabsTrigger value="tabel">Tabel</TabsTrigger>
            <TabsTrigger value="ugentlig">Ugentlig</TabsTrigger>
            <TabsTrigger value="kalender">Kalender</TabsTrigger>
          </TabsList>

          <TabsContent value="tabel" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Køretøj</th>
                    <th className="px-4 py-2.5 font-medium">Nummerplade</th>
                    <th className="px-4 py-2.5 font-medium">Kapacitet</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Fast chauffør</th>
                    <th className="px-4 py-2.5 font-medium">Næste service</th>
                    <th className="px-4 py-2.5 text-right font-medium">Km</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((x) => (
                    <tr key={x.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setSelected(x.id)}>
                      <td className="px-4 py-2.5 font-medium">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                          {x.name}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">{x.plate}</td>
                      <td className="px-4 py-2.5 font-semibold">{x.capacityM3} m³</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_COLORS[x.status])}>
                          {STATUS_LABELS[x.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{x.driverName ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{x.nextService.toLocaleDateString("da-DK")}</td>
                      <td className="px-4 py-2.5 text-right">{number(x.mileageKm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="ugentlig" className="mt-4">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-section">Ugentlig vognplan</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold w-48">Køretøj</th>
                      {DAYS.map((d) => <th key={d} className="px-2 py-2 text-center font-semibold">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((x, i) => (
                      <tr key={x.id} className="border-t">
                        <td className="px-2 py-2">
                          <div className="font-medium">{x.name}</div>
                          <div className="text-[10px] text-muted-foreground">{x.plate} · {x.capacityM3} m³</div>
                        </td>
                        {DAYS.map((d, di) => {
                          const onService = x.status === "service" && di < 2;
                          const assigned = !onService && (di + i) % 4 !== 0;
                          return (
                            <td key={d} className="px-1 py-1 text-center">
                              {onService ? (
                                <div className="rounded bg-warning/10 py-1 text-[10px] text-warning flex items-center justify-center gap-1">
                                  <Wrench className="h-2.5 w-2.5" strokeWidth={2} /> Service
                                </div>
                              ) : assigned ? (
                                <div className="rounded bg-primary/10 py-1 text-[10px] font-medium text-primary">
                                  Job #{100 + (di + i * 7) % 50}
                                </div>
                              ) : (
                                <div className="rounded bg-muted py-1 text-[10px] text-muted-foreground">Fri</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="kalender" className="mt-4">
            <Card className="p-5">
              <h3 className="text-section mb-3">April 2025 · vognassignments</h3>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {DAYS.map((d) => <div key={d} className="text-center font-semibold text-muted-foreground py-1">{d}</div>)}
                {Array.from({ length: 30 }).map((_, i) => {
                  const dayVehicles = vehicles.filter((_v, vi) => (i + vi) % 3 !== 0).slice(0, 3);
                  return (
                    <div key={i} className="min-h-20 rounded border p-1.5 hover:bg-muted/40 cursor-pointer">
                      <div className="text-[10px] font-semibold mb-1">{i + 1}</div>
                      <div className="space-y-0.5">
                        {dayVehicles.map((v) => (
                          <div key={v.id} className="rounded bg-primary/10 px-1 py-0.5 text-[8px] font-medium text-primary truncate">
                            {v.plate}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {v && (
            <>
              <SheetHeader>
                <SheetTitle>{v.name} · {v.plate}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[11px]", STATUS_COLORS[v.status])}>{STATUS_LABELS[v.status]}</Badge>
                  <Badge variant="outline" className="text-[11px]">{v.capacityM3} m³</Badge>
                </div>
                <Card className="p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><div className="text-xs text-muted-foreground">Kilometer</div><div className="text-sm font-bold">{number(v.mileageKm)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Næste service</div><div className="text-sm font-bold">{v.nextService.toLocaleDateString("da-DK")}</div></div>
                    <div><div className="text-xs text-muted-foreground">Chauffør</div><div className="text-sm font-bold">{v.driverName ?? "—"}</div></div>
                  </div>
                </Card>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Kommende jobs</div>
                  <div className="space-y-2 text-sm">
                    {(vehicleAssignments.find((a) => a.vehicleId === v.id)?.upcoming ?? []).map((u) => (
                      <Card key={u.jobId} className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-muted-foreground">#{u.jobNumber}</span>
                          <span className="text-xs text-muted-foreground">{u.date.toLocaleDateString("da-DK")}</span>
                        </div>
                        <div className="mt-1 font-medium">{u.customerName}</div>
                        <div className="text-xs text-muted-foreground">{u.route}</div>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Noter</div>
                  <p className="text-sm">{v.notes}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
