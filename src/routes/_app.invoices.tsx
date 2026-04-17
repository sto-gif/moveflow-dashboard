import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { invoices, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, type InvoiceStatus } from "@/mocks/invoices";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/invoices")({
  head: () => ({
    meta: [
      { title: "Fakturaer — Flyt" },
      { name: "description", content: "Fakturering og lønsomhed pr. job." },
    ],
  }),
  component: InvoicesPage,
});

const FILTERS: ("alle" | InvoiceStatus)[] = ["alle", "udkast", "sendt", "betalt", "forfalden"];

function InvoicesPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("alle");
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = invoices.filter((i) => filter === "alle" || i.status === filter);
  const inv = invoices.find((i) => i.id === selected);

  const outstanding = invoices.filter((i) => i.status === "sendt" || i.status === "forfalden").reduce((s, i) => s + i.amount, 0);
  const paidMTD = invoices.filter((i) => i.status === "betalt" && i.issuedAt.getMonth() === new Date().getMonth()).reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "forfalden").reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <PageHeader title="Fakturaer" description={`${invoices.length} fakturaer`}
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Ny faktura</Button>} />
      <div className="space-y-4 p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="p-4"><div className="text-xs text-muted-foreground">Udestående</div><div className="mt-1 text-2xl font-bold">{dkk(outstanding)}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">Betalt denne måned</div><div className="mt-1 text-2xl font-bold text-emerald-600">{dkk(paidMTD)}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">Forfalden</div><div className="mt-1 text-2xl font-bold text-destructive">{dkk(overdue)}</div></Card>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
              onClick={() => setFilter(f)} className="capitalize">
              {f === "alle" ? "Alle" : INVOICE_STATUS_LABELS[f]}
            </Button>
          ))}
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">Nr.</th>
                <th className="px-4 py-2.5">Kunde</th>
                <th className="px-4 py-2.5">Udstedt</th>
                <th className="px-4 py-2.5">Forfald</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Beløb</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setSelected(i.id)}>
                  <td className="px-4 py-2.5 font-mono">I-{i.number}</td>
                  <td className="px-4 py-2.5 font-medium">{i.customerName}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{i.issuedAt.toLocaleDateString("da-DK")}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{i.dueAt.toLocaleDateString("da-DK")}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className={cn("text-[10px]", INVOICE_STATUS_COLORS[i.status])}>{INVOICE_STATUS_LABELS[i.status]}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">{dkk(i.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {inv && (
            <>
              <SheetHeader>
                <SheetTitle>Faktura I-{inv.number}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <Card className="p-4">
                  <div className="text-xs uppercase text-muted-foreground">Kunde</div>
                  <div className="mt-1 text-base font-semibold">{inv.customerName}</div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><div className="text-xs text-muted-foreground">Udstedt</div><div>{inv.issuedAt.toLocaleDateString("da-DK")}</div></div>
                    <div><div className="text-xs text-muted-foreground">Forfald</div><div>{inv.dueAt.toLocaleDateString("da-DK")}</div></div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs uppercase text-muted-foreground mb-2">Lønsomhed</div>
                  <div className="space-y-2 text-sm">
                    <Row label="Omsætning" value={dkk(inv.amount)} />
                    <Row label="Crew (60 %)" value={`-${dkk(Math.round(inv.cost * 0.6))}`} />
                    <Row label="Udstyr (15 %)" value={`-${dkk(Math.round(inv.cost * 0.15))}`} />
                    <Row label="Brændstof (25 %)" value={`-${dkk(Math.round(inv.cost * 0.25))}`} />
                    <div className="border-t pt-2 flex items-center justify-between font-bold">
                      <span>Margin</span>
                      <span className="text-emerald-600">{dkk(inv.amount - inv.cost)} ({Math.round(((inv.amount - inv.cost) / inv.amount) * 100)} %)</span>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
