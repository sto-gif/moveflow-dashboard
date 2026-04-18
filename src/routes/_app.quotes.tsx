import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Send, Sparkles, Calculator, Trash2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { StageSelect } from "@/components/stage-select";
import { CreateDialog } from "@/components/create-dialog";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS, PRICING_LABELS, type PricingModel, type QuoteLineItem, type QuoteStatus, buildQuoteLineItems } from "@/mocks/quotes";
import { movingPackages } from "@/mocks/packages";
import { useMockStore } from "@/store/mock-store";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/quotes")({
  head: () => ({
    meta: [
      { title: "Tilbud — Movena" },
      { name: "description", content: "Byg flytte-tilbud med tre prismodeller, pakker og prisnedbrydning." },
    ],
  }),
  component: QuotesPage,
});

const STEPS = ["Kunde", "Volumen", "Layout", "Services", "Parkering", "Transport", "Tillæg"] as const;

function QuotesPage() {
  const { quotes, createQuote, convertQuoteToJob, updateQuoteStatus } = useMockStore();
  const navigate = useNavigate();

  const handleConvert = (id: string) => {
    const job = convertQuoteToJob(id);
    if (job) {
      toast.success(`Job #${job.number} oprettet fra tilbud`);
      navigate({ to: "/jobs" });
    }
  };

  return (
    <div>
      <PageHeader
        title="Tilbud"
        description={`${quotes.length} tilbud · ${quotes.filter((q) => q.status === "sendt").length} sendt · ${quotes.filter((q) => q.status === "accepteret").length} accepteret`}
        actions={
          <CreateDialog
            title="Nyt tilbud"
            fields={[
              { name: "customerName", label: "Kunde", defaultValue: "Ny kunde" },
              { name: "total", label: "Total (DKK)", type: "number", defaultValue: 18500 },
            ]}
            onSubmit={(v) => {
              const q = createQuote({ customerName: v.customerName!, total: Number(v.total) || 0 });
              toast.success(`Tilbud Q-${q.number} oprettet`);
            }}
            trigger={<Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Nyt tilbud</Button>}
          />
        }
      />
      <div className="p-6">
        <Tabs defaultValue="oversigt">
          <TabsList>
            <TabsTrigger value="oversigt">Oversigt</TabsTrigger>
            <TabsTrigger value="builder">Tilbudsbygger</TabsTrigger>
            <TabsTrigger value="pakker">Flyttepakker</TabsTrigger>
          </TabsList>

          <TabsContent value="oversigt" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">Nr.</th>
                    <th className="px-4 py-2.5">Kunde</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Prismodel</th>
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
                      <td className="px-4 py-2.5 text-muted-foreground capitalize">{q.customerType}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{PRICING_LABELS[q.pricingModel]}</td>
                      <td className="px-4 py-2.5">
                        <StageSelect
                          value={q.status}
                          options={["udkast", "sendt", "accepteret", "afvist", "udløbet"] as QuoteStatus[]}
                          labels={QUOTE_STATUS_LABELS}
                          colors={QUOTE_STATUS_COLORS}
                          onChange={(s) => { updateQuoteStatus(q.id, s); toast.success(`Q-${q.number}: ${QUOTE_STATUS_LABELS[s]}`); }}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{q.validUntil.toLocaleDateString("da-DK")}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="font-semibold">{dkk(q.total)}</div>
                        {q.manuallyAdjusted && <Badge variant="outline" className="mt-1 text-[9px] border-orange/40 text-orange">Justeret</Badge>}
                      </td>
                      <td className="px-4 py-2.5">
                        {q.status === "accepteret" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleConvert(q.id)}>
                            Konvertér til job
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="mt-4">
            <QuoteBuilder />
          </TabsContent>

          <TabsContent value="pakker" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              {movingPackages.map((p) => (
                <Card key={p.id} className={cn("p-5 relative", p.recommended && "border-primary ring-1 ring-primary")}>
                  {p.recommended && (
                    <Badge className="absolute -top-2 left-4 bg-primary">Mest valgt</Badge>
                  )}
                  <div className="text-section">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.tagline}</div>
                  <div className="my-4 text-2xl font-bold">{dkk(p.basePrice)}<span className="text-xs font-normal text-muted-foreground"> / fra</span></div>
                  <ul className="space-y-1.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 text-success shrink-0" strokeWidth={2} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-5 w-full" variant={p.recommended ? "default" : "outline"}>Vælg pakke</Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


function QuoteBuilder() {
  const [step, setStep] = useState(0);
  const [pricingModel, setPricingModel] = useState<PricingModel>("kvm");
  const [isBusiness, setIsBusiness] = useState(false);
  const [customLineItems, setCustomLineItems] = useState<QuoteLineItem[]>([]);
  const [adjusted, setAdjusted] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "Lars Hansen",
    email: "lars@example.dk",
    phone: "+45 22 33 44 55",
    addressFrom: "Vesterbrogade 12, 1620 København",
    addressTo: "Strandvejen 88, 2100 København Ø",
    moveDate: "2025-05-15",
    homeSizeM2: 95,
    rooms: 3,
    propertyType: "lejlighed" as "lejlighed" | "rækkehus" | "villa",
    floorFrom: 3,
    floorTo: 1,
    elevatorFrom: false,
    elevatorTo: true,
    basement: false,
    attic: false,
    packing: true,
    cleaning: false,
    storage: false,
    disassembly: true,
    heavyItems: 1,
    parkingDistanceFrom: 30,
    parkingDistanceTo: 10,
    crewSize: 3,
    estimatedHours: 6,
    hourlyRate: 595,
    distanceKm: 18,
    weekendSurcharge: false,
    cvr: "",
    companyName: "",
  });

  const setF = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm({ ...form, [k]: v });

  const computedItems = useMemo(() => buildQuoteLineItems({ ...form, pricingModel, customerType: isBusiness ? "erhverv" : "privat", status: "udkast", customerId: "", customerName: form.name, packageId: undefined, createdAt: new Date(), validUntil: new Date(), volumeM3: Math.round(form.homeSizeM2 * 0.4) }), [form, pricingModel, isBusiness]);
  const allItems = [...computedItems, ...customLineItems];
  const baseTotal = allItems.reduce((s, li) => s + li.amount, 0);
  const total = adjusted ?? baseTotal;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-section">Tilbudsbygger</h3>
            <p className="text-xs text-muted-foreground">{STEPS[step]} ({step + 1} af {STEPS.length})</p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Erhverv</Label>
            <Switch checked={isBusiness} onCheckedChange={setIsBusiness} />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-success/15 text-success" : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-md border p-2">
          <Label className="text-xs shrink-0">Prismodel</Label>
          <Select value={pricingModel} onValueChange={(v) => setPricingModel(v as PricingModel)}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["kvm", "time", "manuel"] as PricingModel[]).map((p) => (
                <SelectItem key={p} value={p}>{PRICING_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {step === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {isBusiness && (
              <>
                <Field label="Firmanavn"><Input value={form.companyName} onChange={(e) => setF("companyName", e.target.value)} /></Field>
                <Field label="CVR"><Input value={form.cvr} onChange={(e) => setF("cvr", e.target.value)} /></Field>
              </>
            )}
            <Field label="Kontaktperson"><Input value={form.name} onChange={(e) => setF("name", e.target.value)} /></Field>
            <Field label="Email"><Input value={form.email} onChange={(e) => setF("email", e.target.value)} /></Field>
            <Field label="Telefon"><Input value={form.phone} onChange={(e) => setF("phone", e.target.value)} /></Field>
            <Field label="Flyttedato"><Input type="date" value={form.moveDate} onChange={(e) => setF("moveDate", e.target.value)} /></Field>
            <Field label="Adresse fra" full><Input value={form.addressFrom} onChange={(e) => setF("addressFrom", e.target.value)} /></Field>
            <Field label="Adresse til" full><Input value={form.addressTo} onChange={(e) => setF("addressTo", e.target.value)} /></Field>
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Boligstørrelse (m²)"><Input type="number" value={form.homeSizeM2} onChange={(e) => setF("homeSizeM2", +e.target.value)} /></Field>
            <Field label="Antal værelser"><Input type="number" value={form.rooms} onChange={(e) => setF("rooms", +e.target.value)} /></Field>
            <Field label="Boligtype" full>
              <Select value={form.propertyType} onValueChange={(v) => setF("propertyType", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lejlighed">Lejlighed (×1.0)</SelectItem>
                  <SelectItem value="rækkehus">Rækkehus (×1.1)</SelectItem>
                  <SelectItem value="villa">Villa (×1.15)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Etage fra"><Input type="number" value={form.floorFrom} onChange={(e) => setF("floorFrom", +e.target.value)} /></Field>
            <Field label="Etage til"><Input type="number" value={form.floorTo} onChange={(e) => setF("floorTo", +e.target.value)} /></Field>
            <ToggleField label="Elevator fra" checked={form.elevatorFrom} onChange={(v) => setF("elevatorFrom", v)} />
            <ToggleField label="Elevator til" checked={form.elevatorTo} onChange={(v) => setF("elevatorTo", v)} />
            <ToggleField label="Kælder" checked={form.basement} onChange={(v) => setF("basement", v)} />
            <ToggleField label="Loft" checked={form.attic} onChange={(v) => setF("attic", v)} />
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleField label="Pakkeservice" checked={form.packing} onChange={(v) => setF("packing", v)} />
            <ToggleField label="Demontering & montering" checked={form.disassembly} onChange={(v) => setF("disassembly", v)} />
            <ToggleField label="Slutrengøring" checked={form.cleaning} onChange={(v) => setF("cleaning", v)} />
            <ToggleField label="Opbevaring" checked={form.storage} onChange={(v) => setF("storage", v)} />
            <Field label="Tunge genstande (klaver, pengeskab…)" full><Input type="number" value={form.heavyItems} onChange={(e) => setF("heavyItems", +e.target.value)} /></Field>
          </div>
        )}
        {step === 4 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Parkeringsafstand fra (m)"><Input type="number" value={form.parkingDistanceFrom} onChange={(e) => setF("parkingDistanceFrom", +e.target.value)} /></Field>
            <Field label="Parkeringsafstand til (m)"><Input type="number" value={form.parkingDistanceTo} onChange={(e) => setF("parkingDistanceTo", +e.target.value)} /></Field>
          </div>
        )}
        {step === 5 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Antal medarbejdere"><Input type="number" value={form.crewSize} onChange={(e) => setF("crewSize", +e.target.value)} /></Field>
            <Field label="Estimerede timer"><Input type="number" value={form.estimatedHours} onChange={(e) => setF("estimatedHours", +e.target.value)} /></Field>
            <Field label="Timepris (DKK)"><Input type="number" value={form.hourlyRate} onChange={(e) => setF("hourlyRate", +e.target.value)} /></Field>
            <Field label="Afstand (km)"><Input type="number" value={form.distanceKm} onChange={(e) => setF("distanceKm", +e.target.value)} /></Field>
          </div>
        )}
        {step === 6 && (
          <div className="space-y-3">
            <ToggleField label="Weekend-/aftentillæg" checked={form.weekendSurcharge} onChange={(v) => setF("weekendSurcharge", v)} />
            <div>
              <Label className="text-xs mb-2 block">Manuel prisjustering</Label>
              <div className="flex gap-2">
                <Input type="number" placeholder={String(baseTotal)} value={adjusted ?? ""} onChange={(e) => setAdjusted(e.target.value ? +e.target.value : null)} />
                {adjusted !== null && <Button variant="outline" size="sm" onClick={() => setAdjusted(null)}>Nulstil</Button>}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Forrige</Button>
          <Button disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>Næste</Button>
        </div>
      </Card>

      <Card className="p-5 h-fit sticky top-20">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" strokeWidth={1.5} />
          <h3 className="text-section">Prisnedbrydning</h3>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">Live opdatering · {PRICING_LABELS[pricingModel]}</p>

        <div className="mt-4 space-y-1.5 text-sm max-h-[340px] overflow-y-auto">
          {allItems.map((li) => (
            <div key={li.id} className="flex items-center justify-between gap-2 border-b pb-1.5 last:border-0">
              <div className="flex-1 text-xs">{li.label}</div>
              <div className="font-semibold tabular-nums">{dkk(li.amount)}</div>
              {customLineItems.some((c) => c.id === li.id) && (
                <button onClick={() => setCustomLineItems(customLineItems.filter((c) => c.id !== li.id))}>
                  <Trash2 className="h-3 w-3 text-destructive" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline" size="sm" className="mt-2 w-full"
          onClick={() => setCustomLineItems([...customLineItems, { id: `custom-${Date.now()}`, label: "Brugerdefineret post", amount: 500, category: "manuel" }])}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Tilføj linje
        </Button>

        <div className="mt-5 rounded-md bg-primary/10 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total</span>
            {adjusted !== null && <Badge variant="outline" className="border-orange/40 text-orange text-[9px]">Justeret</Badge>}
          </div>
          <div className="text-2xl font-bold text-primary tabular-nums">{dkk(total)}</div>
          {adjusted !== null && (
            <div className="text-[11px] text-muted-foreground line-through">{dkk(baseTotal)}</div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Button variant="outline" className="flex-1"><Sparkles className="h-4 w-4" strokeWidth={1.5} /> Udkast</Button>
          <Button className="flex-1"><Send className="h-4 w-4" strokeWidth={1.5} /> Send</Button>
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

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <Label className="text-sm cursor-pointer">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
