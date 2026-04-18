import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus, Sparkles, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Indstillinger — Movena" },
      { name: "description", content: "Konfigurér virksomhed, team, tilbudsformular og abonnement." },
    ],
  }),
  component: SettingsPage,
});

const TEAM = [
  { name: "Anders Nielsen", email: "anders@movena.dk", role: "Ejer" },
  { name: "Mette Sørensen", email: "mette@movena.dk", role: "Operations Manager" },
  { name: "Lars Hansen", email: "lars@movena.dk", role: "Holdleder" },
  { name: "Sofie Pedersen", email: "sofie@movena.dk", role: "Salg" },
  { name: "Kasper Jensen", email: "kasper@movena.dk", role: "Bogholder" },
];

const ONBOARDING = [
  { task: "Opret virksomhedsprofil", done: true },
  { task: "Tilføj første medarbejder", done: true },
  { task: "Opret første tilbud", done: true },
  { task: "Konfigurer email-skabeloner", done: false },
  { task: "Tilslut Stripe til betalinger", done: false },
  { task: "Importér eksisterende kunder", done: false },
];

const PLANS = [
  {
    name: "Starter",
    price: 499,
    tagline: "For mindre flyttefirmaer",
    features: ["Op til 3 brugere", "100 jobs/mdr.", "Kunder og tilbud", "Email-support"],
  },
  {
    name: "Professional",
    price: 1299,
    tagline: "Mest populære",
    recommended: true,
    features: ["Op til 15 brugere", "Ubegrænset jobs", "Lager og opbevaring", "Daglig brief", "Telefonsupport"],
  },
  {
    name: "Enterprise",
    price: 2999,
    tagline: "Til store flyttekæder",
    features: ["Ubegrænset brugere", "Multi-lokation", "API & integrationer", "Personlig konsulent", "SLA 99.9%"],
  },
];

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Indstillinger" description="Konfigurér din konto, virksomhed og platform" />
      <div className="p-6">
        <Tabs defaultValue="company">
          <TabsList className="flex-wrap">
            <TabsTrigger value="company">Virksomhed</TabsTrigger>
            <TabsTrigger value="team">Team & roller</TabsTrigger>
            <TabsTrigger value="quoteform">Tilbudsformular</TabsTrigger>
            <TabsTrigger value="subscription">Abonnement</TabsTrigger>
            <TabsTrigger value="notif">Notifikationer</TabsTrigger>
            <TabsTrigger value="integ">Integrationer</TabsTrigger>
            <TabsTrigger value="start">Kom i gang</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-4">
            <Card className="p-6 max-w-2xl">
              <h3 className="text-section mb-4">Virksomhedsprofil</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Firmanavn"><Input defaultValue="Movena Demo ApS" /></Field>
                <Field label="CVR-nr."><Input defaultValue="38291045" /></Field>
                <Field label="Adresse" full><Input defaultValue="Industrivej 24, 2730 Herlev" /></Field>
                <Field label="Telefon"><Input defaultValue="+45 70 20 30 40" /></Field>
                <Field label="Email"><Input defaultValue="kontakt@movena.dk" /></Field>
                <Field label="Hjemmeside" full><Input defaultValue="https://movena.dk" /></Field>
                <Field label="Valuta">
                  <Select defaultValue="DKK">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DKK">DKK — Danske kroner</SelectItem>
                      <SelectItem value="EUR">EUR — Euro</SelectItem>
                      <SelectItem value="SEK">SEK — Svenske kroner</SelectItem>
                      <SelectItem value="NOK">NOK — Norske kroner</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Tidszone">
                  <Select defaultValue="cph">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cph">Europe/Copenhagen (CET)</SelectItem>
                      <SelectItem value="sto">Europe/Stockholm (CET)</SelectItem>
                      <SelectItem value="osl">Europe/Oslo (CET)</SelectItem>
                      <SelectItem value="lon">Europe/London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Standardsprog" full>
                  <Select defaultValue="da">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="da">Dansk</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Button className="mt-5">Gem ændringer</Button>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-section">Brugere</h3>
                <Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Inviter</Button>
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

          <TabsContent value="quoteform" className="mt-4">
            <QuoteFormSettings />
          </TabsContent>

          <TabsContent value="subscription" className="mt-4 space-y-4">
            <Card className="p-5 border-orange/30 bg-orange/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange" strokeWidth={1.5} />
                    <span className="text-section">Prøveperiode aktiv</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">12 dage tilbage på Professional-planen.</div>
                </div>
                <Button>Opgradér nu</Button>
              </div>
            </Card>
            <div className="grid gap-4 md:grid-cols-3">
              {PLANS.map((p) => (
                <Card key={p.name} className={cn("p-5 relative", p.recommended && "border-primary ring-1 ring-primary")}>
                  {p.recommended && <Badge className="absolute -top-2 left-4 bg-primary">Mest valgt</Badge>}
                  <div className="text-section">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.tagline}</div>
                  <div className="my-4 text-2xl font-bold">{dkk(p.price)}<span className="text-xs font-normal text-muted-foreground"> /md.</span></div>
                  <ul className="space-y-1.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 text-success shrink-0" strokeWidth={2} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-5 w-full" variant={p.recommended ? "default" : "outline"}>Vælg {p.name}</Button>
                </Card>
              ))}
            </div>
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
              <h3 className="text-section">Kom godt i gang</h3>
              <p className="mt-1 text-sm text-muted-foreground">{ONBOARDING.filter((o) => o.done).length} af {ONBOARDING.length} trin gennemført</p>
              <div className="mt-4 space-y-2">
                {ONBOARDING.map((o) => (
                  <div key={o.task} className="flex items-center gap-3 rounded-md border p-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${o.done ? "bg-success text-white" : "border-2 border-muted-foreground/40"}`}>
                      {o.done && <Check className="h-3 w-3" strokeWidth={2} />}
                    </div>
                    <span className={`text-sm ${o.done ? "line-through text-muted-foreground" : "font-medium"}`}>{o.task}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="mt-4">
            <Card className="p-6 max-w-2xl space-y-4">
              <h3 className="text-section">Send feedback</h3>
              <Field label="Emne"><Input placeholder="Kort beskrivelse" /></Field>
              <Field label="Besked"><Textarea rows={6} placeholder="Fortæl os, hvad du tænker…" /></Field>
              <Button>Send feedback</Button>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-4 grid gap-3 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-section">Kontakt support</h3>
              <p className="mt-1 text-sm text-muted-foreground">Vi svarer typisk inden for 2 timer i hverdage.</p>
              <div className="mt-4 space-y-1 text-sm">
                <div>📧 support@movena.dk</div>
                <div>📞 +45 70 20 30 40</div>
                <div>🕐 Man–fre 08:00–17:00</div>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-section">Hjælpecenter</h3>
              <p className="mt-1 text-sm text-muted-foreground">Find svar på de mest stillede spørgsmål.</p>
              <Button variant="outline" className="mt-4">Åbn hjælpecenter</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function QuoteFormSettings() {
  const [steps, setSteps] = useState([
    "Kunde", "Volumen", "Layout", "Services", "Parkering", "Transport", "Tillæg",
  ]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j]!, next[i]!];
    setSteps(next);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 p-6 space-y-5">
        <div>
          <h3 className="text-section">Tilbudsformular</h3>
          <p className="text-xs text-muted-foreground">Konfigurér hvordan kunder oplever din online tilbudsformular.</p>
        </div>

        <div>
          <Label className="text-xs">Standard prismodel</Label>
          <Select defaultValue="kvm">
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="kvm">Kvadratmeter (m²)</SelectItem>
              <SelectItem value="time">Timepris</SelectItem>
              <SelectItem value="manuel">Manuel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs mb-2 block">Synlige felter</Label>
          <div className="space-y-2">
            {[
              "Boligstørrelse", "Antal værelser", "Etage og elevator",
              "Pakkeservice", "Demontering", "Parkering", "Tunge genstande",
              "Weekend-tillæg", "Opbevaring",
            ].map((f) => (
              <div key={f} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm">{f}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs mb-2 block">Rækkefølge på trin</Label>
          <div className="space-y-1.5">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 rounded-md border p-2">
                <span className="font-mono text-xs text-muted-foreground w-6">{i + 1}.</span>
                <span className="flex-1 text-sm font-medium">{s}</span>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => move(i, 1)} disabled={i === steps.length - 1}>
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs mb-2 block">Udseende</Label>
          <Field label="Firmanavn på formular"><Input defaultValue="Movena Demo ApS" /></Field>
          <Field label="Primærfarve"><Input defaultValue="#1D4ED8" /></Field>
          <Field label="Tak-side besked"><Textarea rows={3} defaultValue="Tak! Vi vender tilbage med et tilbud inden for 24 timer." /></Field>
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <div className="text-sm font-medium">Aktivér erhvervsformular</div>
            <div className="text-xs text-muted-foreground">Ekstra felter for CVR og firmanavn.</div>
          </div>
          <Switch defaultChecked />
        </div>

        <Button>Gem indstillinger</Button>
      </Card>

      <Card className="p-5 h-fit sticky top-20 bg-muted/30">
        <div className="mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="text-section">Live preview</h3>
        </div>
        <div className="rounded-lg bg-background p-4 shadow-sm border">
          <div className="text-xs font-semibold text-primary">Movena Demo ApS</div>
          <div className="mt-2 text-base font-bold">Få et flytte-tilbud</div>
          <div className="mt-1 text-xs text-muted-foreground">Trin 1 af {steps.length}: {steps[0]}</div>
          <div className="mt-3 space-y-2">
            <div className="h-7 rounded-md bg-muted" />
            <div className="h-7 rounded-md bg-muted" />
            <div className="h-7 rounded-md bg-muted w-3/4" />
          </div>
          <Button className="mt-4 w-full" size="sm">Næste</Button>
        </div>
      </Card>
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
