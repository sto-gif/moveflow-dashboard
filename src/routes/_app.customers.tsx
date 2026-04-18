import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, LayoutGrid, Table as TableIcon, Mail, Phone, Building2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { customers, STAGE_LABELS, type CustomerStage, type CustomerType } from "@/mocks/customers";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/customers")({
  head: () => ({
    meta: [
      { title: "Kunder — Movena" },
      { name: "description", content: "Kundedatabase med privat- og erhvervskunder, kanban og tabel." },
    ],
  }),
  component: CustomersPage,
});

const STAGES: CustomerStage[] = ["booket", "i_gang", "afsluttet"];

function CustomersPage() {
  const [tab, setTab] = useState<"alle" | CustomerType>("alle");
  const [view, setView] = useState<"kanban" | "table">("table");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const typeMatch = tab === "alle" || c.type === tab;
        const q = search.toLowerCase();
        const sMatch = !q ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.cvr ?? "").includes(q);
        return typeMatch && sMatch;
      }),
    [tab, search],
  );

  const customer = customers.find((c) => c.id === selected);

  return (
    <div>
      <PageHeader
        title="Kunder"
        description={`${customers.length} kunder · ${customers.filter((c) => c.type === "privat").length} private · ${customers.filter((c) => c.type === "erhverv").length} erhverv`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <Input placeholder="Søg navn, email, CVR…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-64 pl-8" />
            </div>
            <div className="flex rounded-md border bg-background p-0.5">
              <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} className="h-7 px-2" onClick={() => setView("kanban")}>
                <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
              </Button>
              <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} className="h-7 px-2" onClick={() => setView("table")}>
                <TableIcon className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>
            <Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Ny kunde</Button>
          </>
        }
      />

      <div className="space-y-4 p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="alle">Alle ({customers.length})</TabsTrigger>
            <TabsTrigger value="privat">
              <User className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Privat ({customers.filter((c) => c.type === "privat").length})
            </TabsTrigger>
            <TabsTrigger value="erhverv">
              <Building2 className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Erhverv ({customers.filter((c) => c.type === "erhverv").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {view === "kanban" ? (
              <div className="grid gap-3 lg:grid-cols-5">
                {STAGES.map((stage) => {
                  const items = filtered.filter((c) => c.stage === stage);
                  const total = items.reduce((s, c) => s + c.value, 0);
                  return (
                    <div key={stage} className="rounded-lg bg-muted/40 p-2.5">
                      <div className="mb-2 flex items-center justify-between px-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {STAGE_LABELS[stage]}
                        </span>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{items.length}</Badge>
                      </div>
                      <div className="mb-2 px-1 text-[11px] text-muted-foreground">{dkk(total)}</div>
                      <div className="space-y-2">
                        {items.map((c) => (
                          <Card key={c.id} onClick={() => setSelected(c.id)} className="cursor-pointer p-3 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-medium text-sm leading-snug">{c.name}</div>
                              {c.type === "erhverv" && <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" strokeWidth={1.5} />}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">{c.address.city}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs font-semibold">{dkk(c.value)}</span>
                              <Badge variant="outline" className="text-[10px]">{c.source}</Badge>
                            </div>
                          </Card>
                        ))}
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
                      <th className="px-4 py-2.5 font-medium">Kontakt</th>
                      <th className="px-4 py-2.5 font-medium">By</th>
                      <th className="px-4 py-2.5 font-medium">Sidste job</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 text-right font-medium">Total værdi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setSelected(c.id)}>
                        <td className="px-4 py-2.5">
                          <div className="font-medium">{c.name}</div>
                          {c.cvr && <div className="text-[11px] text-muted-foreground">CVR {c.cvr}</div>}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={cn("text-[10px] capitalize", c.type === "erhverv" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-border")}>
                            {c.type === "erhverv" ? <Building2 className="mr-1 h-3 w-3" strokeWidth={1.5} /> : <User className="mr-1 h-3 w-3" strokeWidth={1.5} />}
                            {c.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          <div>{c.email}</div>
                          <div>{c.phone}</div>
                        </td>
                        <td className="px-4 py-2.5">{c.address.city}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {c.lastJobDate ? c.lastJobDate.toLocaleDateString("da-DK") : "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className="text-[10px]">{STAGE_LABELS[c.stage]}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold">{dkk(c.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {customer && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {customer.type === "erhverv" ? <Building2 className="h-5 w-5 text-primary" strokeWidth={1.5} /> : <User className="h-5 w-5 text-primary" strokeWidth={1.5} />}
                  {customer.name}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[11px] capitalize", customer.type === "erhverv" && "border-blue-200 bg-blue-50 text-blue-700")}>
                    {customer.type}
                  </Badge>
                  {customer.cvr && <Badge variant="outline" className="text-[11px]">CVR {customer.cvr}</Badge>}
                  <Badge variant="outline" className="text-[11px]">{STAGE_LABELS[customer.stage]}</Badge>
                </div>

                <Card className="p-4">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Kontakt</div>
                  <div className="mt-2 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} /> {customer.email}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} /> {customer.phone}</div>
                    <div className="text-muted-foreground">
                      {customer.address.street}, {customer.address.zip} {customer.address.city}
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><div className="text-xs text-muted-foreground">Total værdi</div><div className="text-base font-bold">{dkk(customer.totalValue)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Flytninger</div><div className="text-base font-bold">{customer.previousJobs.length}</div></div>
                    <div><div className="text-xs text-muted-foreground">Kilde</div><div className="text-sm font-semibold">{customer.source}</div></div>
                  </div>
                </Card>

                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Tidligere jobs ({customer.previousJobs.length})</div>
                  {customer.previousJobs.length ? (
                    <div className="space-y-2">
                      {customer.previousJobs.map((p) => (
                        <Card key={p.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-mono text-[11px] text-muted-foreground">#{p.number}</div>
                              <div className="text-sm font-medium">{p.description}</div>
                              <div className="text-[11px] text-muted-foreground">{p.date.toLocaleDateString("da-DK")}</div>
                            </div>
                            <div className="text-sm font-semibold">{dkk(p.amount)}</div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Ingen tidligere jobs registreret.</p>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Kommunikation ({customer.communications.length})</div>
                  <div className="space-y-2 text-sm">
                    {customer.communications.map((c, i) => (
                      <div key={c.id} className={cn("border-l-2 pl-3 pb-2", i === 0 ? "border-primary" : "border-border")}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] capitalize">{c.kind}</Badge>
                          <div className="font-medium">{c.title}</div>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{c.date.toLocaleDateString("da-DK")}</div>
                        <div className="mt-1 text-xs">{c.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Noter</div>
                  <p className="text-sm">{customer.notes}</p>
                </div>

                {customer.tags.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {customer.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
