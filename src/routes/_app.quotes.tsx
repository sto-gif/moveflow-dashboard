import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/page-header";
import { quotes, QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from "@/mocks/quotes";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/quotes")({
  head: () => ({
    meta: [
      { title: "Tilbud — Flyt" },
      { name: "description", content: "Opret og administrer flytte-tilbud i DKK." },
    ],
  }),
  component: QuotesPage,
});

const EXTRAS = ["Pakning", "Opbevaring", "Klaver", "Forsikring +"];

function QuotesPage() {
  const [vol, setVol] = useState(35);
  const [dist, setDist] = useState(45);
  const [crewSize, setCrewSize] = useState(3);
  const [floor, setFloor] = useState(2);
  const [extras, setExtras] = useState<string[]>(["Pakning"]);
  const total = vol * 450 + dist * 18 + crewSize * 1200 + extras.length * 1500 + floor * 250;

  return (
    <div>
      <PageHeader title="Tilbud" description={`${quotes.length} tilbud · ${quotes.filter((q) => q.status === "sendt").length} sendt`}
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Nyt tilbud</Button>} />
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5">Nr.</th>
                  <th className="px-4 py-2.5">Kunde</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Gyldigt til</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="border-t hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-mono">Q-{q.number}</td>
                    <td className="px-4 py-2.5 font-medium">{q.customerName}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className={cn("text-[10px]", QUOTE_STATUS_COLORS[q.status])}>
                        {QUOTE_STATUS_LABELS[q.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{q.validUntil.toLocaleDateString("da-DK")}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{dkk(q.total)}</td>
                    <td className="px-4 py-2.5">
                      {q.status === "accepteret" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs">Konvertér til job</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
        <Card className="p-5 h-fit sticky top-20">
          <h3 className="text-sm font-semibold">Hurtig beregner</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Live total i DKK</p>
          <div className="mt-4 space-y-3">
            <Field label="Volumen (m³)"><Input type="number" value={vol} onChange={(e) => setVol(+e.target.value || 0)} className="h-8" /></Field>
            <Field label="Afstand (km)"><Input type="number" value={dist} onChange={(e) => setDist(+e.target.value || 0)} className="h-8" /></Field>
            <Field label="Antal medarbejdere"><Input type="number" value={crewSize} onChange={(e) => setCrewSize(+e.target.value || 0)} className="h-8" /></Field>
            <Field label="Etage"><Input type="number" value={floor} onChange={(e) => setFloor(+e.target.value || 0)} className="h-8" /></Field>
            <div>
              <Label className="text-xs">Tillæg</Label>
              <div className="mt-2 space-y-1.5">
                {EXTRAS.map((e) => (
                  <label key={e} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={extras.includes(e)}
                      onCheckedChange={(v) => setExtras(v ? [...extras, e] : extras.filter((x) => x !== e))} />
                    {e}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-md bg-primary/10 p-3">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold text-primary">{dkk(total)}</div>
          </div>
          <Button className="mt-3 w-full"><Send className="h-4 w-4" /> Send tilbud</Button>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
