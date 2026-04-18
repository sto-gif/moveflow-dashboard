import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, LayoutGrid, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { CreateDialog } from "@/components/create-dialog";
import { StageSelect } from "@/components/stage-select";
import { KanbanBoard } from "@/components/kanban-board";
import { LEAD_STAGE_LABELS, LEAD_STAGE_COLORS, type LeadStage } from "@/mocks/leads";
import { useMockStore } from "@/store/mock-store";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/leads/")({
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
  const { leads, createLead, updateLeadStage } = useMockStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "value" | "moveDate" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: "name" | "value" | "moveDate") => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = leads.filter((l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        const av = sortKey === "name" ? a.name : sortKey === "value" ? a.estimatedValue : a.moveDate.getTime();
        const bv = sortKey === "name" ? b.name : sortKey === "value" ? b.estimatedValue : b.moveDate.getTime();
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    return list;
  }, [leads, search, sortKey, sortDir]);

  const totalPipeline = useMemo(
    () => leads.filter((l) => l.stage !== "tabt" && l.stage !== "vundet").reduce((s, l) => s + l.estimatedValue, 0),
    [leads],
  );
  const newCount = leads.filter((l) => l.stage === "ny").length;

  const itemsByColumn = useMemo(() => {
    const map = {} as Record<LeadStage, typeof filtered>;
    STAGES.forEach((s) => { map[s] = filtered.filter((l) => l.stage === s); });
    return map;
  }, [filtered]);

  const handleMove = (leadId: string, toStage: LeadStage) => {
    updateLeadStage(leadId, toStage);
    toast.success(`Flyttet til ${LEAD_STAGE_LABELS[toStage]}`);
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${leads.length} leads · ${dkk(totalPipeline)} i pipeline · ${newCount} nye`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <Input placeholder="Søg leads…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-56 pl-8" />
            </div>
            <CreateDialog
              title="Nyt lead"
              fields={[
                { name: "name", label: "Navn", defaultValue: "Ny kontakt" },
                { name: "email", label: "Email", type: "email", defaultValue: "kontakt@example.dk" },
                { name: "phone", label: "Telefon", type: "tel", defaultValue: "+45 22 33 44 55" },
                { name: "city", label: "By", defaultValue: "København" },
                { name: "estimatedValue", label: "Estimeret værdi (DKK)", type: "number", defaultValue: 18000 },
              ]}
              onSubmit={(v) => {
                const lead = createLead({
                  name: v.name!, email: v.email!, phone: v.phone!, city: v.city!,
                  estimatedValue: Number(v.estimatedValue) || 0,
                });
                toast.success(`Lead ${lead.name} oprettet`);
                navigate({ to: "/leads/$leadId", params: { leadId: lead.id } });
              }}
              trigger={<Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Nyt lead</Button>}
            />
          </>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban"><LayoutGrid className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Kanban</TabsTrigger>
            <TabsTrigger value="table"><TableIcon className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Tabel</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-4">
            <KanbanBoard
              className="grid gap-3 md:grid-cols-3 xl:grid-cols-6"
              columns={STAGES.map((s) => ({
                id: s,
                label: LEAD_STAGE_LABELS[s],
                items: itemsByColumn[s],
                footer: dkk(itemsByColumn[s].reduce((sum, l) => sum + l.estimatedValue, 0)),
              }))}
              itemsByColumn={itemsByColumn}
              onMove={handleMove}
              renderCard={(l) => (
                <Link
                  to="/leads/$leadId" params={{ leadId: l.id }}
                  className="kanban-card block"
                  onClick={(e) => { if ((e.target as HTMLElement).closest("[data-no-nav]")) e.preventDefault(); }}
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
              )}
            />
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-caption uppercase text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">
                      <button onClick={() => toggleSort("name")} className="hover:text-foreground">
                        Navn {sortKey === "name" && (sortDir === "asc" ? "▲" : "▼")}
                      </button>
                    </th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">By</th>
                    <th className="px-4 py-2.5 font-medium">Kilde</th>
                    <th className="px-4 py-2.5 font-medium">Fase</th>
                    <th className="px-4 py-2.5 font-medium">Ejer</th>
                    <th className="px-4 py-2.5 font-medium">
                      <button onClick={() => toggleSort("moveDate")} className="hover:text-foreground">
                        Flytter {sortKey === "moveDate" && (sortDir === "asc" ? "▲" : "▼")}
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">
                      <button onClick={() => toggleSort("value")} className="hover:text-foreground">
                        Værdi {sortKey === "value" && (sortDir === "asc" ? "▲" : "▼")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="cursor-pointer border-t hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-2.5 cell-primary">
                        <Link to="/leads/$leadId" params={{ leadId: l.id }} className="hover:underline">{l.name}</Link>
                      </td>
                      <td className="px-4 py-2.5 capitalize text-muted-foreground">{l.type}</td>
                      <td className="px-4 py-2.5">{l.city}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{l.source}</td>
                      <td className="px-4 py-2.5">
                        <StageSelect
                          value={l.stage}
                          options={STAGES}
                          labels={LEAD_STAGE_LABELS}
                          colors={LEAD_STAGE_COLORS}
                          onChange={(s) => handleMove(l.id, s)}
                        />
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

void cn;
