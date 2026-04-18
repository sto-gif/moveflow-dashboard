import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CustomerDrawer } from "@/components/customer-drawer";
import { Plus, Search, Building2, User, LayoutGrid, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { CreateDialog } from "@/components/create-dialog";
import { StageSelect } from "@/components/stage-select";
import { KanbanBoard } from "@/components/kanban-board";
import { STAGE_LABELS, STAGE_COLORS, type CustomerStage, type CustomerType } from "@/mocks/customers";
import { useMockStore } from "@/store/mock-store";
import { dkk } from "@/lib/format";

export const Route = createFileRoute("/_app/customers/")({
  head: () => ({
    meta: [
      { title: "Kunder — Movena" },
      { name: "description", content: "Kundedatabase med privat- og erhvervskunder, pipeline og tabel." },
    ],
  }),
  component: CustomersPage,
});

const STAGES: CustomerStage[] = ["booket", "i_gang", "afsluttet"];

function CustomersPage() {
  const { customers, createCustomer, updateCustomerStage } = useMockStore();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<"alle" | CustomerType>("alle");
  const [search, setSearch] = useState("");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const typeMatch = typeFilter === "alle" || c.type === typeFilter;
        const q = search.toLowerCase();
        const sMatch = !q ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.cvr ?? "").includes(q);
        return typeMatch && sMatch;
      }),
    [customers, typeFilter, search],
  );

  const privateCount = customers.filter((c) => c.type === "privat").length;
  const erhvervCount = customers.filter((c) => c.type === "erhverv").length;

  const itemsByColumn = useMemo(() => {
    const map = {} as Record<CustomerStage, typeof filtered>;
    STAGES.forEach((s) => { map[s] = filtered.filter((c) => c.stage === s); });
    return map;
  }, [filtered]);

  const handleMove = (id: string, stage: CustomerStage) => {
    updateCustomerStage(id, stage);
    toast.success(`Kunde flyttet til ${STAGE_LABELS[stage]}`);
  };

  return (
    <div>
      <PageHeader
        title="Kunder"
        description={`${customers.length} kunder · ${privateCount} private · ${erhvervCount} erhverv`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <Input placeholder="Søg navn, email, CVR…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-64 pl-8" />
            </div>
            <CreateDialog
              title="Ny kunde"
              fields={[
                { name: "name", label: "Navn", defaultValue: "Ny kunde" },
                { name: "email", label: "Email", type: "email", defaultValue: "ny.kunde@example.dk" },
                { name: "phone", label: "Telefon", type: "tel", defaultValue: "+45 33 44 55 66" },
                { name: "type", label: "Type (privat/erhverv)", defaultValue: "privat" },
              ]}
              onSubmit={(v) => {
                const c = createCustomer({
                  name: v.name!, email: v.email!, phone: v.phone!,
                  type: v.type === "erhverv" ? "erhverv" : "privat",
                });
                toast.success(`Kunde ${c.name} oprettet`);
                setDrawerId(c.id);
              }}
              trigger={<Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Ny kunde</Button>}
            />
          </>
        }
      />

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={typeFilter === "alle" ? "secondary" : "ghost"} onClick={() => setTypeFilter("alle")}>
            Alle ({customers.length})
          </Button>
          <Button size="sm" variant={typeFilter === "privat" ? "secondary" : "ghost"} onClick={() => setTypeFilter("privat")}>
            <User className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Privat ({privateCount})
          </Button>
          <Button size="sm" variant={typeFilter === "erhverv" ? "secondary" : "ghost"} onClick={() => setTypeFilter("erhverv")}>
            <Building2 className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Erhverv ({erhvervCount})
          </Button>
        </div>

        <Tabs defaultValue="pipeline">
          <TabsList>
            <TabsTrigger value="pipeline"><LayoutGrid className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Pipeline</TabsTrigger>
            <TabsTrigger value="table"><TableIcon className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Tabel</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="mt-4">
            <KanbanBoard
              className="grid gap-3 lg:grid-cols-3"
              columns={STAGES.map((s) => ({
                id: s,
                label: STAGE_LABELS[s],
                items: itemsByColumn[s],
                footer: dkk(itemsByColumn[s].reduce((sum, c) => sum + c.value, 0)),
              }))}
              itemsByColumn={itemsByColumn}
              onMove={handleMove}
              renderCard={(c) => (
                <button type="button" onClick={() => setDrawerId(c.id)} className="kanban-card block w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-label leading-snug">{c.name}</div>
                    {c.type === "erhverv" && <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />}
                  </div>
                  <div className="mt-1 text-caption text-muted-foreground">{c.address.city}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-caption font-semibold tabular-nums">{dkk(c.value)}</span>
                    <Badge variant="outline" className="text-[10px]">{c.source}</Badge>
                  </div>
                </button>
              )}
            />
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-caption uppercase text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Navn</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Kontakt</th>
                    <th className="px-4 py-2.5 font-medium">By</th>
                    <th className="px-4 py-2.5 font-medium">Sidste job</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium">Total værdi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="cursor-pointer border-t hover:bg-[#F8FAFC] transition-colors"
                      onClick={() => setDrawerId(c.id)}
                    >
                      <td className="px-4 py-2.5">
                        <div className="cell-primary hover:underline">{c.name}</div>
                        {c.cvr && <div className="text-[11px] text-muted-foreground tabular-nums">CVR {c.cvr}</div>}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {c.type === "erhverv" ? <Building2 className="mr-1 h-3 w-3" strokeWidth={1.5} /> : <User className="mr-1 h-3 w-3" strokeWidth={1.5} />}
                          {c.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-caption text-muted-foreground">
                        <div>{c.email}</div>
                        <div className="tabular-nums">{c.phone}</div>
                      </td>
                      <td className="px-4 py-2.5">{c.address.city}</td>
                      <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                        {c.lastJobDate ? c.lastJobDate.toLocaleDateString("da-DK") : "—"}
                      </td>
                      <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <StageSelect
                          value={c.stage}
                          options={STAGES}
                          labels={STAGE_LABELS}
                          colors={STAGE_COLORS}
                          onChange={(s) => handleMove(c.id, s)}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{dkk(c.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CustomerDrawer
        customerId={drawerId}
        open={drawerId !== null}
        onOpenChange={(o) => { if (!o) setDrawerId(null); }}
      />
    </div>
  );
}
