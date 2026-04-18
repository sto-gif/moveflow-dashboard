import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, Building2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { customers, STAGE_LABELS, type CustomerStage, type CustomerType } from "@/mocks/customers";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/customers")({
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
  const [typeFilter, setTypeFilter] = useState<"alle" | CustomerType>("alle");
  const [search, setSearch] = useState("");

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
    [typeFilter, search],
  );

  const privateCount = useMemo(() => customers.filter((c) => c.type === "privat").length, []);
  const erhvervCount = useMemo(() => customers.filter((c) => c.type === "erhverv").length, []);

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
            <Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Ny kunde</Button>
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
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="table">Tabel</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="mt-4">
            <div className="grid gap-3 lg:grid-cols-3">
              {STAGES.map((stage) => {
                const items = filtered.filter((c) => c.stage === stage);
                const total = items.reduce((s, c) => s + c.value, 0);
                return (
                  <div key={stage} className="kanban-column">
                    <div className="kanban-column-header">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                          {STAGE_LABELS[stage]}
                        </div>
                        <div className="mt-0.5 text-caption text-muted-foreground tabular-nums">{dkk(total)}</div>
                      </div>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{items.length}</Badge>
                    </div>
                    <div className="kanban-cards">
                      {items.map((c) => (
                        <Link
                          key={c.id}
                          to="/customers/$customerId"
                          params={{ customerId: c.id }}
                          className="kanban-card block"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-label leading-snug">{c.name}</div>
                            {c.type === "erhverv" && <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />}
                          </div>
                          <div className="mt-1 text-caption text-muted-foreground">{c.address.city}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-caption font-semibold tabular-nums">{dkk(c.value)}</span>
                            <Badge variant="outline" className="text-[10px]">{c.source}</Badge>
                          </div>
                        </Link>
                      ))}
                      {items.length === 0 && (
                        <div className="rounded border border-dashed border-border px-2 py-6 text-center text-caption text-muted-foreground">
                          Ingen kunder
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
                    <th className="px-4 py-2.5 font-medium">Kontakt</th>
                    <th className="px-4 py-2.5 font-medium">By</th>
                    <th className="px-4 py-2.5 font-medium">Sidste job</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 text-right font-medium">Total værdi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="cursor-pointer border-t hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-2.5">
                        <Link to="/customers/$customerId" params={{ customerId: c.id }} className="hover:underline">
                          <div className="cell-primary">{c.name}</div>
                          {c.cvr && <div className="text-[11px] text-muted-foreground tabular-nums">CVR {c.cvr}</div>}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={cn("text-[10px] capitalize")}>
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
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-[10px]">{STAGE_LABELS[c.stage]}</Badge>
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
    </div>
  );
}
