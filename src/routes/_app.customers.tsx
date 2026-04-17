import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, LayoutGrid, Table as TableIcon, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { customers, STAGE_LABELS, type CustomerStage } from "@/mocks/customers";
import { dkk } from "@/lib/format";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/customers")({
  head: () => ({
    meta: [
      { title: "Kunder — Flyt" },
      { name: "description", content: "CRM med lead-pipeline og kundeprofiler." },
    ],
  }),
  component: CustomersPage,
});

const STAGES: CustomerStage[] = ["ny_henvendelse", "tilbud_sendt", "booket", "afsluttet", "tabt"];

function CustomersPage() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );
  const customer = customers.find((c) => c.id === selected);

  return (
    <div>
      <PageHeader
        title="Kunder"
        description={`${customers.length} kunder · ${customers.filter((c) => c.stage === "ny_henvendelse").length} nye henvendelser`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Søg kunder…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-56 pl-8"
              />
            </div>
            <div className="flex rounded-md border bg-background p-0.5">
              <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"}
                className="h-7 px-2" onClick={() => setView("kanban")}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button size="sm" variant={view === "table" ? "secondary" : "ghost"}
                className="h-7 px-2" onClick={() => setView("table")}>
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm"><Plus className="h-4 w-4" /> Ny kunde</Button>
          </>
        }
      />

      <div className="p-6">
        {view === "kanban" ? (
          <div className="grid gap-3 lg:grid-cols-5">
            {STAGES.map((stage) => {
              const items = filtered.filter((c) => c.stage === stage);
              const total = items.reduce((s, c) => s + c.value, 0);
              return (
                <div key={stage} className="rounded-lg bg-muted/40 p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {STAGE_LABELS[stage]}
                      </span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {items.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="mb-2 px-1 text-[11px] text-muted-foreground">{dkk(total)}</div>
                  <div className="space-y-2">
                    {items.map((c) => (
                      <Card key={c.id}
                        onClick={() => setSelected(c.id)}
                        className="cursor-pointer p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm">{c.name}</div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{c.address.city}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-semibold">{dkk(c.value)}</span>
                          <Badge variant="outline" className="text-[10px]">{c.source}</Badge>
                        </div>
                      </Card>
                    ))}
                    {items.length === 0 && (
                      <div className="rounded border border-dashed border-border px-2 py-6 text-center text-xs text-muted-foreground">
                        Ingen kunder
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
                  <th className="px-4 py-2.5 font-medium">By</th>
                  <th className="px-4 py-2.5 font-medium">Fase</th>
                  <th className="px-4 py-2.5 font-medium">Kilde</th>
                  <th className="px-4 py-2.5 text-right font-medium">Værdi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="cursor-pointer border-t hover:bg-muted/40"
                    onClick={() => setSelected(c.id)}>
                    <td className="px-4 py-2.5 font-medium">{c.name}</td>
                    <td className="px-4 py-2.5">{c.address.city}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="text-[10px]">
                        {STAGE_LABELS[c.stage]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.source}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{dkk(c.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {customer && (
            <>
              <SheetHeader>
                <SheetTitle>{customer.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <Card className="p-4">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Kontakt</div>
                  <div className="mt-2 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {customer.email}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {customer.phone}</div>
                    <div className="text-muted-foreground">
                      {customer.address.street}, {customer.address.zip} {customer.address.city}
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><div className="text-xs text-muted-foreground">Værdi</div><div className="text-base font-bold">{dkk(customer.value)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Flytninger</div><div className="text-base font-bold">{customer.moveCount}</div></div>
                    <div><div className="text-xs text-muted-foreground">Kilde</div><div className="text-sm font-semibold">{customer.source}</div></div>
                  </div>
                </Card>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Noter</div>
                  <p className="text-sm">{customer.notes}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags.length ? customer.tags.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    )) : <span className="text-sm text-muted-foreground">Ingen tags</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Kommunikationslog</div>
                  <div className="space-y-2 text-sm">
                    <div className="border-l-2 border-primary pl-3">
                      <div className="font-medium">Tilbud sendt</div>
                      <div className="text-xs text-muted-foreground">2. apr 2025 · Email</div>
                    </div>
                    <div className="border-l-2 border-border pl-3">
                      <div className="font-medium">Indledende opkald</div>
                      <div className="text-xs text-muted-foreground">28. mar 2025 · 12 min</div>
                    </div>
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
