import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { leads, LEAD_STAGE_LABELS, LEAD_STAGE_COLORS, type LeadStage } from "@/mocks/leads";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );
  const totalPipeline = useMemo(
    () =>
      leads
        .filter((l) => l.stage !== "tabt" && l.stage !== "vundet")
        .reduce((s, l) => s + l.estimatedValue, 0),
    [],
  );
  const newCount = useMemo(() => leads.filter((l) => l.stage === "ny").length, []);

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${leads.length} leads · ${dkk(totalPipeline)} i pipeline · ${newCount} nye`}
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
            <Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Nyt lead</Button>
          </>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="table">Tabel</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-4">
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {STAGES.map((stage) => {
                const items = filtered.filter((l) => l.stage === stage);
                const total = items.reduce((s, l) => s + l.estimatedValue, 0);
                return (
                  <div key={stage} className="kanban-column">
                    <div className="kanban-column-header">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                          {LEAD_STAGE_LABELS[stage]}
                        </div>
                        <div className="mt-0.5 text-caption text-muted-foreground tabular-nums">{dkk(total)}</div>
                      </div>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{items.length}</Badge>
                    </div>
                    <div className="kanban-cards">
                      {items.map((l) => (
                        <Link
                          key={l.id}
                          to="/leads/$leadId"
                          params={{ leadId: l.id }}
                          className="kanban-card block"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-label leading-snug">{l.name}</div>
                            <Badge variant="outline" className="text-[9px] capitalize">{l.type}</Badge>
                          </div>
                          <div className="mt-1 text-caption text-muted-foreground">{l.city}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-caption font-semibold tabular-nums">{dkk(l.estimatedValue)}</span>
                            <Badge variant="outline" className="text-[10px]">{l.source}</Badge>
                          </div>
                        </Link>
                      ))}
                      {items.length === 0 && (
                        <div className="rounded border border-dashed border-border px-2 py-6 text-center text-caption text-muted-foreground">
                          Ingen leads
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-caption uppercase text-muted-foreground">
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
                    <tr key={l.id} className="cursor-pointer border-t hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-2.5 cell-primary">
                        <Link to="/leads/$leadId" params={{ leadId: l.id }} className="hover:underline">
                          {l.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 capitalize text-muted-foreground">{l.type}</td>
                      <td className="px-4 py-2.5">{l.city}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{l.source}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={cn("text-[10px]", LEAD_STAGE_COLORS[l.stage])}>
                          {LEAD_STAGE_LABELS[l.stage]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{l.owner}</td>
                      <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{l.moveDate.toLocaleDateString("da-DK")}</td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums">{dkk(l.estimatedValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
