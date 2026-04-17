import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Indstillinger — Flyt" },
      { name: "description", content: "Konfigurér virksomhed, team og integrationer." },
    ],
  }),
  component: SettingsPage,
});

const TEAM = [
  { name: "Anders Nielsen", email: "anders@flyt.dk", role: "Ejer" },
  { name: "Mette Sørensen", email: "mette@flyt.dk", role: "Operations Manager" },
  { name: "Lars Hansen", email: "lars@flyt.dk", role: "Holdleder" },
  { name: "Sofie Pedersen", email: "sofie@flyt.dk", role: "Salg" },
  { name: "Kasper Jensen", email: "kasper@flyt.dk", role: "Bogholder" },
];

const ONBOARDING = [
  { task: "Opret virksomhedsprofil", done: true },
  { task: "Tilføj første medarbejder", done: true },
  { task: "Opret første tilbud", done: true },
  { task: "Konfigurer email-skabeloner", done: false },
  { task: "Tilslut Stripe til betalinger", done: false },
  { task: "Importér eksisterende kunder", done: false },
];

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Indstillinger" description="Konfigurér din konto og virksomhed" />
      <div className="p-6">
        <Tabs defaultValue="company">
          <TabsList className="flex-wrap">
            <TabsTrigger value="company">Virksomhed</TabsTrigger>
            <TabsTrigger value="team">Team & roller</TabsTrigger>
            <TabsTrigger value="notif">Notifikationer</TabsTrigger>
            <TabsTrigger value="integ">Integrationer</TabsTrigger>
            <TabsTrigger value="start">Kom i gang</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-4">
            <Card className="p-6 max-w-2xl">
              <h3 className="text-sm font-semibold mb-4">Virksomhedsprofil</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Firmanavn"><Input defaultValue="Flyt København ApS" /></Field>
                <Field label="CVR-nr."><Input defaultValue="38291045" /></Field>
                <Field label="Adresse" full><Input defaultValue="Industrivej 24, 2730 Herlev" /></Field>
                <Field label="Telefon"><Input defaultValue="+45 70 20 30 40" /></Field>
                <Field label="Email"><Input defaultValue="kontakt@flyt.dk" /></Field>
                <Field label="Hjemmeside" full><Input defaultValue="https://flyt.dk" /></Field>
              </div>
              <Button className="mt-5">Gem ændringer</Button>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Brugere</h3>
                <Button size="sm"><Plus className="h-4 w-4" /> Inviter</Button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">Navn</th><th className="px-4 py-2.5">Email</th><th className="px-4 py-2.5">Rolle</th>
                  </tr>
                </thead>
                <tbody>
                  {TEAM.map((u) => (
                    <tr key={u.email} className="border-t">
                      <td className="px-4 py-2.5 font-medium">{u.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-2.5"><Badge variant="secondary">{u.role}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="notif" className="mt-4">
            <Card className="p-6 max-w-2xl space-y-4">
              {[
                ["Nye kundeforespørgsler", true],
                ["Forfaldne fakturaer", true],
                ["Crew-friønsker", true],
                ["Lager under minimum", true],
                ["Daglig morgensummering", false],
                ["Ugentlig rapport", true],
              ].map(([label, on]) => (
                <div key={String(label)} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <span className="text-sm font-medium">{label}</span>
                  <Switch defaultChecked={!!on} />
                </div>
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="integ" className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              { name: "Stripe", desc: "Modtag online betalinger", connected: false },
              { name: "Economic", desc: "Synkronisér fakturaer og bogføring", connected: true },
              { name: "Google Calendar", desc: "Synkronisér jobs til kalender", connected: false },
              { name: "Twilio", desc: "Send SMS til kunder", connected: true },
              { name: "Mailchimp", desc: "Email-marketing", connected: false },
              { name: "Trustpilot", desc: "Hent anmeldelser automatisk", connected: true },
            ].map((i) => (
              <Card key={i.name} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.desc}</div>
                  </div>
                  <Button size="sm" variant={i.connected ? "outline" : "default"}>
                    {i.connected ? "Forbundet" : "Forbind"}
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="start" className="mt-4">
            <Card className="p-6 max-w-2xl">
              <h3 className="text-sm font-semibold">Kom godt i gang</h3>
              <p className="mt-1 text-sm text-muted-foreground">{ONBOARDING.filter((o) => o.done).length} af {ONBOARDING.length} trin gennemført</p>
              <div className="mt-4 space-y-2">
                {ONBOARDING.map((o) => (
                  <div key={o.task} className="flex items-center gap-3 rounded-md border p-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${o.done ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/40"}`}>
                      {o.done && <Check className="h-3 w-3" />}
                    </div>
                    <span className={`text-sm ${o.done ? "line-through text-muted-foreground" : "font-medium"}`}>{o.task}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="mt-4">
            <Card className="p-6 max-w-2xl space-y-4">
              <h3 className="text-sm font-semibold">Send feedback</h3>
              <Field label="Emne"><Input placeholder="Kort beskrivelse" /></Field>
              <Field label="Besked"><Textarea rows={6} placeholder="Fortæl os, hvad du tænker…" /></Field>
              <Button>Send feedback</Button>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-4 grid gap-3 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-semibold">Kontakt support</h3>
              <p className="mt-1 text-sm text-muted-foreground">Vi svarer typisk inden for 2 timer i hverdage.</p>
              <div className="mt-4 space-y-1 text-sm">
                <div>📧 support@flyt.dk</div>
                <div>📞 +45 70 20 30 40</div>
                <div>🕐 Man–fre 08:00–17:00</div>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold">Hjælpecenter</h3>
              <p className="mt-1 text-sm text-muted-foreground">Find svar på de mest stillede spørgsmål.</p>
              <Button variant="outline" className="mt-4">Åbn hjælpecenter</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
