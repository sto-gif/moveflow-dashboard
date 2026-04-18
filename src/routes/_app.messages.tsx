import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageSquare, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { sequences } from "@/mocks/messages";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({
    meta: [
      { title: "Automatiske Flows — Movena" },
      { name: "description", content: "Automatiserede SMS- og email-sekvenser til kunder." },
    ],
  }),
  component: FlowsPage,
});

function inferTiming(trigger: string): string {
  const t = trigger.toLowerCase();
  if (t.includes("24")) return "24h";
  if (t.includes("30 min") || t.includes("30min")) return "30min";
  if (t.includes("3 dage")) return "3d_after";
  if (t.includes("dagen efter") || t.includes("1 dag")) return "1d_after";
  return "now";
}

function FlowsPage() {
  const [seqs, setSeqs] = useState(sequences);

  return (
    <div>
      <PageHeader
        title="Automatiske Flows"
        description={`${seqs.length} sekvenser · ${seqs.filter((s) => s.enabled).length} aktive`}
        actions={<Button size="sm"><Zap className="h-4 w-4" strokeWidth={1.5} /> Ny sekvens</Button>}
      />
      <div className="space-y-4 p-6">
        {seqs.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-section">{s.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {s.channel === "sms" ? <><MessageSquare className="mr-1 h-3 w-3" />SMS</> : <><Mail className="mr-1 h-3 w-3" />Email</>}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs">Trigger</Label>
                    <Select defaultValue={s.trigger}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={s.trigger}>{s.trigger}</SelectItem>
                        <SelectItem value="quote_accepted">Tilbud accepteret</SelectItem>
                        <SelectItem value="day_before">Dagen før job</SelectItem>
                        <SelectItem value="job_started">Job startet</SelectItem>
                        <SelectItem value="job_completed">Job afsluttet</SelectItem>
                        <SelectItem value="invoice_paid">Faktura betalt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Timing</Label>
                    <Select defaultValue={inferTiming(s.trigger)}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Med det samme</SelectItem>
                        <SelectItem value="30min">30 min. før</SelectItem>
                        <SelectItem value="1h">1 time før</SelectItem>
                        <SelectItem value="24h">24 timer før job</SelectItem>
                        <SelectItem value="1d_after">1 dag efter job</SelectItem>
                        <SelectItem value="3d_after">3 dage efter job</SelectItem>
                        <SelectItem value="7d_after">7 dage efter job</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Kanal</Label>
                    <Select defaultValue={s.channel}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Skabelon</Label>
                  <Textarea defaultValue={s.template} rows={3} className="mt-1" />
                </div>
              </div>

              <Switch
                checked={s.enabled}
                onCheckedChange={(v) => setSeqs(seqs.map((x) => x.id === s.id ? { ...x, enabled: v } : x))}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

