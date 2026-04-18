import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Mail, Phone, MapPin, Warehouse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { storageUnits, type StorageStatus } from "@/mocks/storage";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/lager")({
  head: () => ({
    meta: [
      { title: "Lager — Movena" },
      { name: "description", content: "Kundeopbevaring og lagerenheder." },
    ],
  }),
  component: LagerPage,
});

const STATUS_COLORS: Record<StorageStatus, string> = {
  aktiv: "bg-emerald-100 text-emerald-700 border-emerald-200",
  afsluttet: "bg-slate-100 text-slate-700 border-slate-200",
  afventer: "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<StorageStatus, string> = {
  aktiv: "Aktiv",
  afsluttet: "Afsluttet",
  afventer: "Afventer",
};

function LagerPage() {
  const [filter, setFilter] = useState<"alle" | StorageStatus>("alle");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = storageUnits.filter((u) => {
    const matchesStatus = filter === "alle" || u.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      u.unitNumber.toLowerCase().includes(q) ||
      u.customerName.toLowerCase().includes(q) ||
      u.description.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
  const unit = storageUnits.find((u) => u.id === selected);

  const stats = {
    aktive: storageUnits.filter((u) => u.status === "aktiv").length,
    omsaetning: storageUnits.filter((u) => u.status === "aktiv").reduce((s, u) => s + u.monthlyPrice, 0),
    totalM3: storageUnits.filter((u) => u.status === "aktiv").reduce((s, u) => s + u.sizeM3, 0),
  };

  return (
    <div>
      <PageHeader
        title="Lager"
        description={`${stats.aktive} aktive enheder · ${stats.totalM3} m³ · ${dkk(stats.omsaetning)} pr. mdr.`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <Input placeholder="Søg…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-56 pl-8" />
            </div>
            <Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Ny enhed</Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Aktive enheder</span>
              <Warehouse className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="mt-2 text-xl font-bold">{stats.aktive}</div>
          </Card>
          <Card className="p-4">
            <span className="text-xs font-medium text-muted-foreground">Total volumen</span>
            <div className="mt-2 text-xl font-bold">{stats.totalM3} m³</div>
          </Card>
          <Card className="p-4">
            <span className="text-xs font-medium text-muted-foreground">Månedlig omsætning</span>
            <div className="mt-2 text-xl font-bold">{dkk(stats.omsaetning)}</div>
          </Card>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="alle">Alle ({storageUnits.length})</TabsTrigger>
            <TabsTrigger value="aktiv">Aktive ({stats.aktive})</TabsTrigger>
            <TabsTrigger value="afventer">Afventer</TabsTrigger>
            <TabsTrigger value="afsluttet">Afsluttede</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Enhed</th>
                <th className="px-4 py-2.5 font-medium">Kunde</th>
                <th className="px-4 py-2.5 font-medium">Beskrivelse</th>
                <th className="px-4 py-2.5 font-medium">Lokation</th>
                <th className="px-4 py-2.5 font-medium">Start</th>
                <th className="px-4 py-2.5 font-medium">Slut</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Pris/mdr.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setSelected(u.id)}>
                  <td className="px-4 py-2.5 font-mono font-semibold">{u.unitNumber}</td>
                  <td className="px-4 py-2.5 font-medium">{u.customerName}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.description}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.location}</td>
                  <td className="px-4 py-2.5">{u.startDate.toLocaleDateString("da-DK")}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.endDate ? u.endDate.toLocaleDateString("da-DK") : "Løbende"}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className={cn("text-[10px]", STATUS_COLORS[u.status])}>
                      {STATUS_LABELS[u.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">{dkk(u.monthlyPrice)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Ingen lagerenheder matcher filteret.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {unit && (
            <>
              <SheetHeader>
                <SheetTitle>Enhed {unit.unitNumber}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[11px]", STATUS_COLORS[unit.status])}>{STATUS_LABELS[unit.status]}</Badge>
                  <Badge variant="outline" className="text-[11px]">{unit.sizeM3} m³</Badge>
                  <Badge variant="outline" className="text-[11px]">{unit.location}</Badge>
                </div>
                <Card className="p-4">
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Kunde</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="font-semibold">{unit.customerName}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" strokeWidth={1.5} /> {unit.customerEmail}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" strokeWidth={1.5} /> {unit.customerPhone}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> {unit.customerAddress}</div>
                  </div>
                </Card>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Beskrivelse</div>
                  <p className="text-sm">{unit.description}</p>
                </div>
                <Card className="p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><div className="text-xs text-muted-foreground">Start</div><div className="text-sm font-semibold">{unit.startDate.toLocaleDateString("da-DK")}</div></div>
                    <div><div className="text-xs text-muted-foreground">Slut</div><div className="text-sm font-semibold">{unit.endDate ? unit.endDate.toLocaleDateString("da-DK") : "Løbende"}</div></div>
                    <div><div className="text-xs text-muted-foreground">Pris/mdr.</div><div className="text-sm font-semibold">{dkk(unit.monthlyPrice)}</div></div>
                  </div>
                </Card>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Kontrakt</div>
                  <a className="text-sm text-primary hover:underline" href="#">{unit.contract}</a>
                </div>
                <div className="flex gap-2 pt-2">
                  {unit.status === "aktiv" && <Button size="sm" variant="outline" className="flex-1">Afslut opbevaring</Button>}
                  <Button size="sm" className="flex-1">Rediger</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
