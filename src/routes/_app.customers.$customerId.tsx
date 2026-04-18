import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Mail, Phone, Building2, User, MessageSquare,
  Truck, Package, FileText, Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { customers, STAGE_LABELS } from "@/mocks/customers";
import { jobs, JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "@/mocks/jobs";
import { quotes, QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from "@/mocks/quotes";
import { storageUnits } from "@/mocks/storage";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/customers/$customerId")({
  loader: ({ params }) => {
    const customer = customers.find((c) => c.id === params.customerId);
    if (!customer) throw notFound();
    return { customer };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.customer.name ?? "Kunde"} — Movena` }],
  }),
  component: CustomerDetailPage,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p className="text-section">Kunde ikke fundet</p>
      <Link to="/customers" className="mt-3 inline-block text-primary underline">Tilbage til kunder</Link>
    </div>
  ),
});

function CustomerDetailPage() {
  const { customer } = Route.useLoaderData();
  const customerJobs = jobs.filter((j) => j.customerId === customer.id);
  const customerQuotes = quotes.filter((q) => q.customerId === customer.id);
  const customerStorage = storageUnits.filter((s) => s.customerId === customer.id);
  const firstMoveDate = customerJobs.length
    ? customerJobs.reduce((min, j) => (j.date < min ? j.date : min), customerJobs[0]!.date)
    : null;

  const [notes, setNotes] = useState<{ id: string; text: string; at: Date }[]>([
    { id: "n1", text: customer.notes, at: customer.createdAt },
  ]);
  const [draft, setDraft] = useState("");
  const addNote = () => {
    if (!draft.trim()) return;
    setNotes((n) => [{ id: `n${n.length + 1}`, text: draft, at: new Date() }, ...n]);
    setDraft("");
  };

  const TypeIcon = customer.type === "erhverv" ? Building2 : User;

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4">
        <Link to="/customers" className="inline-flex w-fit items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Tilbage til kunder
        </Link>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-page-title">
              <TypeIcon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              {customer.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[11px] capitalize">{customer.type}</Badge>
              {customer.cvr && <Badge variant="outline" className="text-[11px]">CVR {customer.cvr}</Badge>}
              <Badge variant="outline" className="text-[11px]">{STAGE_LABELS[customer.stage]}</Badge>
              <span className="text-body-sm text-muted-foreground">
                Lifetime value: <span className="font-semibold text-foreground tabular-nums">{dkk(customer.totalValue)}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline"><Send className="h-4 w-4" strokeWidth={1.5} /> Send tilbud</Button>
            <Button size="sm"><Truck className="h-4 w-4" strokeWidth={1.5} /> Nyt job</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4">
            <div className="text-caption uppercase text-muted-foreground">Kontakt</div>
            <div className="mt-3 space-y-2 text-body">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> {customer.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /> {customer.phone}</div>
              <div className="text-body-sm text-muted-foreground">
                {customer.address.street}, {customer.address.zip} {customer.address.city}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-caption uppercase text-muted-foreground">Statistik</div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="text-caption text-muted-foreground">Total værdi</div>
                <div className="text-section tabular-nums">{dkk(customer.totalValue)}</div>
              </div>
              <div>
                <div className="text-caption text-muted-foreground">Antal flytninger</div>
                <div className="text-section tabular-nums">{customerJobs.length}</div>
              </div>
              <div>
                <div className="text-caption text-muted-foreground">Kilde</div>
                <div className="text-label">{customer.source}</div>
              </div>
              <div>
                <div className="text-caption text-muted-foreground">Første flytning</div>
                <div className="text-label">
                  {firstMoveDate ? firstMoveDate.toLocaleDateString("da-DK") : "—"}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="moves">
          <TabsList>
            <TabsTrigger value="moves"><Truck className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Flytninger ({customerJobs.length})</TabsTrigger>
            <TabsTrigger value="quotes"><FileText className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Tilbud ({customerQuotes.length})</TabsTrigger>
            <TabsTrigger value="comm"><MessageSquare className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Kommunikation ({customer.communications.length})</TabsTrigger>
            <TabsTrigger value="storage"><Package className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Lager ({customerStorage.length})</TabsTrigger>
            <TabsTrigger value="notes">Noter ({notes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="moves" className="mt-4">
            <Card className="overflow-x-auto">
              {customerJobs.length === 0 ? (
                <div className="p-8 text-center text-body-sm text-muted-foreground">Ingen flytninger registreret.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left text-caption uppercase text-muted-foreground">
                      <th className="px-4 py-2.5">Job #</th>
                      <th className="px-4 py-2.5">Dato</th>
                      <th className="px-4 py-2.5">Rute</th>
                      <th className="px-4 py-2.5 text-right">Volumen</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Pris</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerJobs.map((j) => (
                      <tr key={j.id} className="border-t hover:bg-muted/40">
                        <td className="px-4 py-2.5 font-mono text-caption">#{j.number}</td>
                        <td className="px-4 py-2.5">{j.date.toLocaleDateString("da-DK")}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{j.origin.city} → {j.destination.city}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{j.volumeM3} m³</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={cn("text-[10px]", JOB_STATUS_COLORS[j.status])}>
                            {JOB_STATUS_LABELS[j.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums">{dkk(j.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="mt-4">
            <Card className="overflow-x-auto">
              {customerQuotes.length === 0 ? (
                <div className="p-8 text-center text-body-sm text-muted-foreground">Ingen tilbud.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left text-caption uppercase text-muted-foreground">
                      <th className="px-4 py-2.5">Nr.</th>
                      <th className="px-4 py-2.5">Oprettet</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Beløb</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerQuotes.map((q) => (
                      <tr key={q.id} className="border-t hover:bg-muted/40">
                        <td className="px-4 py-2.5 font-mono text-caption">Q-{q.number}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{q.createdAt.toLocaleDateString("da-DK")}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={cn("text-[10px]", QUOTE_STATUS_COLORS[q.status])}>
                            {QUOTE_STATUS_LABELS[q.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums">{dkk(q.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="comm" className="mt-4">
            <Card className="space-y-3 p-4">
              {customer.communications
                .slice()
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((c) => (
                  <div key={c.id} className="border-l-2 border-border pl-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] capitalize">{c.kind}</Badge>
                      <div className="text-label">{c.title}</div>
                      <div className="ml-auto text-caption text-muted-foreground">{c.date.toLocaleDateString("da-DK")}</div>
                    </div>
                    <div className="mt-1 text-body-sm text-muted-foreground">{c.summary}</div>
                  </div>
                ))}
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="mt-4">
            <Card className="overflow-x-auto">
              {customerStorage.length === 0 ? (
                <div className="p-8 text-center text-body-sm text-muted-foreground">Ingen aktive lagerenheder.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left text-caption uppercase text-muted-foreground">
                      <th className="px-4 py-2.5">Enhed</th>
                      <th className="px-4 py-2.5">Beskrivelse</th>
                      <th className="px-4 py-2.5">Lokation</th>
                      <th className="px-4 py-2.5">Start</th>
                      <th className="px-4 py-2.5 text-right">Størrelse</th>
                      <th className="px-4 py-2.5 text-right">Pris/md.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerStorage.map((s) => (
                      <tr key={s.id} className="border-t hover:bg-muted/40">
                        <td className="px-4 py-2.5 font-mono text-caption">{s.unitNumber}</td>
                        <td className="px-4 py-2.5">{s.description}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{s.location}</td>
                        <td className="px-4 py-2.5">{s.startDate.toLocaleDateString("da-DK")}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{s.sizeM3} m³</td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums">{dkk(s.monthlyPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card className="space-y-3 p-4">
              <Textarea
                placeholder="Tilføj note om denne kunde…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-20"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={addNote} disabled={!draft.trim()}>Tilføj note</Button>
              </div>
              <div className="space-y-3 pt-2">
                {notes.map((n) => (
                  <div key={n.id} className="border-l-2 border-border pl-3">
                    <div className="text-caption text-muted-foreground">{n.at.toLocaleString("da-DK", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                    <div className="text-body">{n.text}</div>
                  </div>
                ))}
              </div>
              {customer.tags.length > 0 && (
                <div className="border-t border-border pt-3">
                  <div className="text-caption uppercase text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
