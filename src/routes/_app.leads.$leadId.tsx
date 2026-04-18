import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Mail, Phone, Calendar, MapPin, FileText,
  MessageSquare, UserPlus, Send, Clock, CheckCircle2, FileSignature, Plus, Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { leads as seedLeads, LEAD_STAGE_LABELS, LEAD_STAGE_COLORS } from "@/mocks/leads";
import { quotes, QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from "@/mocks/quotes";
import { useMockStore } from "@/store/mock-store";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/leads/$leadId")({
  head: () => ({ meta: [{ title: "Lead — Movena" }] }),
  component: LeadDetailPage,
});

function LeadDetailPage() {
  const { leadId } = Route.useParams();
  const { leads, updateLeadStage, updateLead, convertLeadToCustomer, createQuote } = useMockStore();
  const navigate = useNavigate();
  const lead = leads.find((l) => l.id === leadId) ?? seedLeads.find((l) => l.id === leadId);
  const [notes, setNotes] = useState<{ id: string; text: string; at: Date }[]>(
    lead ? [{ id: "n1", text: lead.note, at: lead.createdAt }] : [],
  );
  const [draft, setDraft] = useState("");
  const [activities, setActivities] = useState<{ id: string; type: "opkald" | "moede" | "email" | "sms"; note: string; at: Date }[]>([]);
  const [actType, setActType] = useState<"opkald" | "moede" | "email" | "sms">("opkald");
  const [actNote, setActNote] = useState("");
  if (!lead) {
    return (
      <div className="p-10 text-center">
        <p className="text-section">Lead ikke fundet</p>
        <Link to="/leads" className="mt-3 inline-block text-primary underline">Tilbage til leads</Link>
      </div>
    );
  }

  const handleSendQuote = () => {
    createQuote({ customerName: lead.name, total: lead.estimatedValue });
    updateLeadStage(lead.id, "tilbud_sendt");
    toast.success(`Tilbud sendt til ${lead.name}`);
    navigate({ to: "/quotes" });
  };

  const handleConvert = () => {
    const c = convertLeadToCustomer(lead.id);
    if (c) {
      toast.success(`${lead.name} konverteret til kunde`);
      navigate({ to: "/customers/$customerId", params: { customerId: c.id } });
    }
  };

  const leadQuotes = quotes.filter((q) => q.customerName === lead.name).slice(0, 5);

  const timeline = [
    { id: "t1", icon: UserPlus, date: lead.createdAt, title: "Lead oprettet", desc: `Lead modtaget via ${lead.source}` },
    { id: "t2", icon: Phone, date: new Date(lead.createdAt.getTime() + 1000 * 60 * 60 * 4), title: "Indledende opkald", desc: `Kontaktet af ${lead.owner}` },
    ...(lead.stage === "tilbud_sendt" || lead.stage === "forhandling" || lead.stage === "vundet"
      ? [{ id: "t3", icon: FileSignature, date: new Date(lead.createdAt.getTime() + 1000 * 60 * 60 * 24), title: "Tilbud sendt", desc: `Estimeret værdi ${dkk(lead.estimatedValue)}` }]
      : []),
    ...(lead.stage === "vundet"
      ? [{ id: "t4", icon: CheckCircle2, date: new Date(lead.createdAt.getTime() + 1000 * 60 * 60 * 72), title: "Lead vundet", desc: "Konverteret til kunde" }]
      : []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const addNote = () => {
    if (!draft.trim()) return;
    setNotes((n) => [{ id: `n${n.length + 1}`, text: draft, at: new Date() }, ...n]);
    setDraft("");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4">
        <Link to="/leads" className="inline-flex w-fit items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Tilbage til leads
        </Link>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Input
              value={lead.name}
              onChange={(e) => updateLead(lead.id, { name: e.target.value })}
              className="h-auto border-0 bg-transparent p-0 text-page-title focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[11px] capitalize">{lead.type}</Badge>
              <Select value={lead.stage} onValueChange={(v) => updateLeadStage(lead.id, v as typeof lead.stage)}>
                <SelectTrigger className={cn("h-7 w-auto gap-1.5 px-2 text-[11px]", LEAD_STAGE_COLORS[lead.stage])}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LEAD_STAGE_LABELS) as Array<typeof lead.stage>).map((s) => (
                    <SelectItem key={s} value={s}>{LEAD_STAGE_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-[11px]">{lead.source}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSendQuote}><Send className="h-4 w-4" strokeWidth={1.5} /> Send tilbud</Button>
            <Button size="sm" onClick={handleConvert}><CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> Konverter til kunde</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4">
            <div className="text-caption uppercase text-muted-foreground">Kontakt</div>
            <div className="mt-3 space-y-2 text-body">
              <label className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <Input value={lead.email} onChange={(e) => updateLead(lead.id, { email: e.target.value })} className="h-8 text-sm" />
              </label>
              <label className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <Input value={lead.phone} onChange={(e) => updateLead(lead.id, { phone: e.target.value })} className="h-8 text-sm" />
              </label>
              <label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <Input value={lead.city} onChange={(e) => updateLead(lead.id, { city: e.target.value })} className="h-8 text-sm" />
              </label>
              <label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <Input
                  type="date"
                  value={lead.moveDate.toISOString().slice(0, 10)}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    if (!isNaN(d.getTime())) updateLead(lead.id, { moveDate: d });
                  }}
                  className="h-8 text-sm"
                />
              </label>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-caption uppercase text-muted-foreground">Tilbud</div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-caption text-muted-foreground">Estimeret værdi (DKK)</span>
                <Input
                  type="number"
                  min={0}
                  value={lead.estimatedValue}
                  onChange={(e) => updateLead(lead.id, { estimatedValue: Number(e.target.value) || 0 })}
                  className="h-9 text-section tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="text-caption text-muted-foreground">Ejer</span>
                <Input value={lead.owner} onChange={(e) => updateLead(lead.id, { owner: e.target.value })} className="h-9 text-sm" />
              </label>
              <div>
                <div className="text-caption text-muted-foreground">Oprettet</div>
                <div className="text-label py-2">{lead.createdAt.toLocaleDateString("da-DK")}</div>
              </div>
              <div>
                <div className="text-caption text-muted-foreground">Kilde</div>
                <div className="text-label py-2">{lead.source}</div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline"><Clock className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Timeline</TabsTrigger>
            <TabsTrigger value="activity"><Activity className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Aktivitet ({activities.length})</TabsTrigger>
            <TabsTrigger value="quotes"><FileText className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Tilbud ({leadQuotes.length})</TabsTrigger>
            <TabsTrigger value="notes"><MessageSquare className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Noter ({notes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <Card className="p-4">
              <ol className="space-y-4">
                {timeline.map((t) => (
                  <li key={t.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569]">
                      <t.icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-label">{t.title}</div>
                        <div className="text-caption text-muted-foreground">{t.date.toLocaleString("da-DK", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                      <div className="mt-1 text-body-sm text-muted-foreground">{t.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card className="space-y-3 p-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={actType} onValueChange={(v) => setActType(v as typeof actType)}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opkald">📞 Opkald</SelectItem>
                    <SelectItem value="moede">🤝 Møde</SelectItem>
                    <SelectItem value="email">✉️ E-mail</SelectItem>
                    <SelectItem value="sms">💬 SMS</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Beskriv aktiviteten…"
                  value={actNote}
                  onChange={(e) => setActNote(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (!actNote.trim()) return;
                    setActivities((a) => [{ id: `a${a.length + 1}`, type: actType, note: actNote, at: new Date() }, ...a]);
                    setActNote("");
                    toast.success("Aktivitet logget");
                  }}
                  disabled={!actNote.trim()}
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} /> Log
                </Button>
              </div>
              {activities.length === 0 ? (
                <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center text-body-sm text-muted-foreground">
                  Ingen aktiviteter logget endnu. Tilføj opkald, møder, e-mails eller SMS ovenfor.
                </div>
              ) : (
                <ol className="space-y-2 pt-2">
                  {activities.map((a) => (
                    <li key={a.id} className="flex items-start gap-3 border-l-2 border-primary/40 pl-3">
                      <Badge variant="outline" className="text-[10px] capitalize">{a.type}</Badge>
                      <div className="flex-1">
                        <div className="text-body-sm">{a.note}</div>
                        <div className="text-caption text-muted-foreground">
                          {a.at.toLocaleString("da-DK", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="mt-4">
            <Card className="overflow-x-auto">
              {leadQuotes.length === 0 ? (
                <div className="p-8 text-center text-body-sm text-muted-foreground">Ingen tilbud sendt endnu.</div>
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
                    {leadQuotes.map((q) => (
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

          <TabsContent value="notes" className="mt-4">
            <Card className="space-y-3 p-4">
              <Textarea
                placeholder="Tilføj note om dette lead…"
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
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
