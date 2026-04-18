import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, LayoutGrid, Table as TableIcon, Phone, Mail, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { leads, LEAD_STAGE_LABELS, LEAD_STAGE_COLORS, type LeadStage } from "@/mocks/leads";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Movena" },
      { name: "description", content: "Salgs-pipeline fra første henvendelse til konverteret kunde." },
    ],
  }),
  component: LeadsPage,
});

const STAGES: LeadStage[] = ["ny", "kontaktet", "tilbud_sendt", "forhandling", "vundet", "tabt"];

function LeadsPage() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );
  const lead = leads.find((l) => l.id === selected);
  const totalPipeline = leads
    .filter((l) => l.stage !== "tabt" && l.stage !== "vundet")
    .reduce((s, l) => s + l.estimatedValue, 0);

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${leads.length} leads · ${dkk(totalPipeline)} i pipeline · ${leads.filter((l) => l.stage === "ny").length} nye`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <Input
                placeholder="Søg leads…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-56 pl-8"
              />
            </div>
            <div className="flex rounded-md border bg-background p-0.5">
              <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"}
                className="h-7 px-2" onClick={() => setView("kanban")}>
                <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
              </Button>
              <Button size="sm" variant={view === "table" ? "secondary" : "ghost"}
                className="h-7 px-2" onClick={() => setView("table")}>
                <TableIcon className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>
            <Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Nyt lead</Button>
          </>
        }
      />

      <div className="p-6">
        {view === "kanban" ? (
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {STAGES.map((stage) => {
              const items = filtered.filter((l) => l.stage === stage);
              const total = items.reduce((s, l) => s + l.estimatedValue, 0);
              return (
                <div key={stage} className="rounded-lg bg-muted/40 p-2.5">
                  <div className="mb-1 flex items-center justify-between px-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {LEAD_STAGE_LABELS[stage]}
                    </span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="mb-2 px-1 text-[11px] text-muted-foreground">{dkk(total)}</div>
                  <div className="space-y-2">
                    {items.map((l) => (
                      <Card key={l.id} onClick={() => setSelected(l.id)}
                        className="cursor-pointer p-3 hover:shadow-md transition-shadow border-border">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm leading-snug">{l.name}</div>
                          <Badge variant="outline" className={cn("text-[9px] capitalize", l.type === "erhverv" && "bg-blue-50 text-blue-700")}>
                            {l.type}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{l.city}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-semibold">{dkk(l.estimatedValue)}</span>
                          <Badge variant="outline" className="text-[10px] border-border">{l.source}</Badge>
                        </div>
                      </Card>
                    ))}
                    {items.length === 0 && (
                      <div className="rounded border border-dashed border-border px-2 py-6 text-center text-xs text-muted-foreground">
                        Ingen leads
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Navn</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">By</th>
                  <th className="px-4 py-2.5 font-medium">Kilde</th>
                  <th className="px-4 py-2.5 font-medium">Fase</th>
                  <th className="px-4 py-2.5 font-medium">Ejer</th>
                  <th className="px-4 py-2.5 font-medium">Flytter</th>
                  <th className="px-4 py-2.5 text-right font-medium">Værdi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="cursor-pointer border-t hover:bg-muted/40"
                    onClick={() => setSelected(l.id)}>
                    <td className="px-4 py-2.5 font-medium">{l.name}</td>
                    <td className="px-4 py-2.5 capitalize text-muted-foreground">{l.type}</td>
                    <td className="px-4 py-2.5">{l.city}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{l.source}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className={cn("text-[10px]", LEAD_STAGE_COLORS[l.stage])}>
                        {LEAD_STAGE_LABELS[l.stage]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{l.owner}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{l.moveDate.toLocaleDateString("da-DK")}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{dkk(l.estimatedValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {lead && (
            <>
              <SheetHeader>
                <SheetTitle>{lead.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[11px]", LEAD_STAGE_COLORS[lead.stage])}>
                    {LEAD_STAGE_LABELS[lead.stage]}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] capitalize">{lead.type}</Badge>
                  <Badge variant="outline" className="text-[11px]">{lead.source}</Badge>
                </div>
                <Card className="p-4">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Kontakt</div>
                  <div className="mt-2 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} /> {lead.email}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} /> {lead.phone}</div>
                    <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} /> Flyttedato {lead.moveDate.toLocaleDateString("da-DK")}</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><div className="text-xs text-muted-foreground">Estimeret værdi</div><div className="text-base font-bold">{dkk(lead.estimatedValue)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Ejer</div><div className="text-sm font-semibold">{lead.owner}</div></div>
                    <div><div className="text-xs text-muted-foreground">Oprettet</div><div className="text-sm font-semibold">{lead.createdAt.toLocaleDateString("da-DK")}</div></div>
                  </div>
                </Card>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Note</div>
                  <p className="text-sm">{lead.note}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">Send tilbud</Button>
                  <Button size="sm" variant="outline" className="flex-1">Konvertér til kunde</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
