import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RowCount } from "@/components/row-count";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Mail, Phone, Building2, User, MessageSquare,
  Truck, Package, FileText, Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customers as seedCustomers, STAGE_LABELS, type Communication, type CustomerStage, type CustomerType } from "@/mocks/customers";
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "@/mocks/jobs";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from "@/mocks/quotes";
import { storageUnits } from "@/mocks/storage";
import { useMockStore } from "@/store/mock-store";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";

const STAGES: CustomerStage[] = ["booket", "i_gang", "afsluttet"];
const TYPES: CustomerType[] = ["privat", "erhverv"];

export const Route = createFileRoute("/_app/customers/$customerId")({
  head: () => ({ meta: [{ title: "Kunde — Movena" }] }),
  component: CustomerDetailPage,
});

function CustomerDetailPage() {
  const { customerId } = Route.useParams();
  const { customers, jobs, quotes, createJob, createQuote, updateCustomer } = useMockStore();
  const navigate = useNavigate();
  const customer = customers.find((c) => c.id === customerId) ?? seedCustomers.find((c) => c.id === customerId);
  const [notes, setNotes] = useState<{ id: string; text: string; at: Date }[]>(
    customer ? [{ id: "n1", text: customer.notes, at: customer.createdAt }] : [],
  );
  const [draft, setDraft] = useState("");
  if (!customer) {
    return (
      <div className="p-10 text-center">
        <p className="text-section">Kunde ikke fundet</p>
        <Link to="/customers" className="mt-3 inline-block text-primary underline">Tilbage til kunder</Link>
      </div>
    );
  }
  const customerJobs = jobs.filter((j) => j.customerId === customer.id || j.customerName === customer.name);
  const customerQuotes = quotes.filter((q) => q.customerId === customer.id || q.customerName === customer.name);
  const customerStorage = storageUnits.filter((s) => s.customerId === customer.id);
  const firstMoveDate = customerJobs.length
    ? customerJobs.reduce((min, j) => (j.date < min ? j.date : min), customerJobs[0]!.date)
    : null;

  const addNote = () => {
    if (!draft.trim()) return;
    setNotes((n) => [{ id: `n${n.length + 1}`, text: draft, at: new Date() }, ...n]);
    setDraft("");
  };

  const handleSendQuote = () => {
    const q = createQuote({ customerName: customer.name, total: Math.max(customer.value, 15000) });
    toast.success(`Tilbud Q-${q.number} oprettet`);
    navigate({ to: "/quotes" });
  };
  const handleNewJob = () => {
    const j = createJob({ customerName: customer.name, volumeM3: 35, revenue: Math.max(customer.value, 18000), startTime: "08:00" });
    toast.success(`Job #${j.number} oprettet`);
    navigate({ to: "/jobs", search: { job: j.id } });
  };

  const TypeIcon = customer.type === "erhverv" ? Building2 : User;

  const patch = (p: Partial<typeof customer>) => updateCustomer(customer.id, p);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4">
        <Link to="/customers" className="inline-flex w-fit items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Tilbage til kunder
        </Link>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-6 w-6 text-muted-foreground shrink-0" strokeWidth={1.5} />
              <Input
                value={customer.name}
                onChange={(e) => patch({ name: e.target.value })}
                className="h-10 max-w-md border-0 px-2 text-page-title shadow-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Select value={customer.type} onValueChange={(v) => patch({ type: v as CustomerType })}>
                <SelectTrigger className="h-7 w-auto gap-1 px-2 text-[11px] capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={customer.stage} onValueChange={(v) => patch({ stage: v as CustomerStage })}>
                <SelectTrigger className="h-7 w-auto gap-1 px-2 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
              {customer.cvr && <Badge variant="outline" className="text-[11px]">CVR {customer.cvr}</Badge>}
              <span className="text-body-sm text-muted-foreground">
                Lifetime value: <span className="font-semibold text-foreground tabular-nums">{dkk(customer.totalValue)}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSendQuote}><Send className="h-4 w-4" strokeWidth={1.5} /> Send tilbud</Button>
            <Button size="sm" onClick={handleNewJob}><Truck className="h-4 w-4" strokeWidth={1.5} /> Nyt job</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4">
            <div className="text-caption uppercase text-muted-foreground">Kontakt</div>
            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input className="pl-8" value={customer.email} onChange={(e) => patch({ email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Telefon</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input className="pl-8" value={customer.phone} onChange={(e) => patch({ phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Adresse</Label>
                  <Input value={customer.address.street} onChange={(e) => patch({ address: { ...customer.address, street: e.target.value } })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Postnr.</Label>
                  <Input className="w-20" value={customer.address.zip} onChange={(e) => patch({ address: { ...customer.address, zip: e.target.value } })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">By</Label>
                  <Input value={customer.address.city} onChange={(e) => patch({ address: { ...customer.address, city: e.target.value } })} />
                </div>
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
            <Card className="max-h-[640px] overflow-auto">
              {customerJobs.length === 0 ? (
                <div className="p-8 text-center text-body-sm text-muted-foreground">Ingen flytninger registreret.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted">
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
                      <tr
                        key={j.id}
                        className="cursor-pointer border-t hover:bg-muted/40"
                        onClick={() => navigate({ to: "/jobs", search: { job: j.id } })}
                      >
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
            {customerJobs.length > 0 && <RowCount shown={customerJobs.length} total={customerJobs.length} noun="flytninger" />}
          </TabsContent>

          <TabsContent value="quotes" className="mt-4">
            <Card className="max-h-[640px] overflow-auto">
              {customerQuotes.length === 0 ? (
                <div className="p-8 text-center text-body-sm text-muted-foreground">Ingen tilbud.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted">
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
            {customerQuotes.length > 0 && <RowCount shown={customerQuotes.length} total={customerQuotes.length} noun="tilbud" />}
          </TabsContent>

          <TabsContent value="comm" className="mt-4">
            <Card className="space-y-3 p-4">
              {customer.communications
                .slice()
                .sort((a: Communication, b: Communication) => b.date.getTime() - a.date.getTime())
                .map((c: Communication) => (
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
            <Card className="max-h-[640px] overflow-auto">
              {customerStorage.length === 0 ? (
                <div className="p-8 text-center text-body-sm text-muted-foreground">Ingen aktive lagerenheder.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted">
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
            {customerStorage.length > 0 && <RowCount shown={customerStorage.length} total={customerStorage.length} noun="enheder" />}
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
                    {customer.tags.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
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
