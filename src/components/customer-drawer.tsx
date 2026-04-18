import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, Truck, Mail, Phone, Building2, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMockStore } from "@/store/mock-store";
import { STAGE_LABELS, type Customer, type CustomerStage } from "@/mocks/customers";
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "@/mocks/jobs";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STAGES: CustomerStage[] = ["booket", "i_gang", "afsluttet"];

export function CustomerDrawer({
  customerId,
  open,
  onOpenChange,
}: {
  customerId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { customers, jobs, updateCustomer } = useMockStore();
  const navigate = useNavigate();
  const customer = customers.find((c) => c.id === customerId) ?? null;

  const [draft, setDraft] = useState<Customer | null>(customer);
  useEffect(() => {
    setDraft(customer);
  }, [customer?.id, open]);

  if (!customer || !draft) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl" />
      </Sheet>
    );
  }

  const customerJobs = jobs.filter(
    (j) => j.customerId === customer.id || j.customerName === customer.name,
  );

  const TypeIcon = draft.type === "erhverv" ? Building2 : User;

  const save = () => {
    updateCustomer(customer.id, {
      name: draft.name,
      email: draft.email,
      phone: draft.phone,
      stage: draft.stage,
      address: draft.address,
      notes: draft.notes,
    });
    toast.success("Kunde opdateret");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <TypeIcon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              {draft.name}
            </SheetTitle>
            <Button asChild size="sm" variant="outline">
              <Link to="/customers/$customerId" params={{ customerId: customer.id }} onClick={() => onOpenChange(false)}>
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} /> Åbn fuld side
              </Link>
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[11px] capitalize">{draft.type}</Badge>
            {draft.cvr && <Badge variant="outline" className="text-[11px]">CVR {draft.cvr}</Badge>}
            <span className="text-xs text-muted-foreground">
              Total værdi: <span className="font-semibold text-foreground tabular-nums">{dkk(customer.totalValue)}</span>
            </span>
          </div>
        </SheetHeader>

        <Tabs defaultValue="info" className="flex-1">
          <div className="border-b border-border px-5 pt-3">
            <TabsList>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="jobs"><Truck className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Flytninger ({customerJobs.length})</TabsTrigger>
              <TabsTrigger value="notes">Noter</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info" className="space-y-4 p-5">
            <div className="grid gap-3">
              <Field label="Navn">
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                    <Input className="pl-8" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                  </div>
                </Field>
                <Field label="Telefon">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                    <Input className="pl-8" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                  </div>
                </Field>
              </div>
              <Field label="Adresse">
                <Input value={draft.address.street} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, street: e.target.value } })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Postnr.">
                  <Input value={draft.address.zip} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, zip: e.target.value } })} />
                </Field>
                <Field label="By">
                  <Input value={draft.address.city} onChange={(e) => setDraft({ ...draft, address: { ...draft.address, city: e.target.value } })} />
                </Field>
              </div>
              <Field label="Status">
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDraft({ ...draft, stage: s })}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs transition-colors",
                        draft.stage === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      {STAGE_LABELS[s]}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-3 p-5">
            {customerJobs.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                Ingen tidligere flytninger.
              </Card>
            ) : (
              customerJobs.map((j) => (
                <Card
                  key={j.id}
                  className="cursor-pointer p-3 hover:bg-muted/40"
                  onClick={() => {
                    onOpenChange(false);
                    navigate({ to: "/jobs", search: { job: j.id } });
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-[11px] text-muted-foreground">#{j.number}</div>
                      <div className="text-sm font-medium">{j.origin.city} → {j.destination.city}</div>
                      <div className="text-xs text-muted-foreground">
                        {j.date.toLocaleDateString("da-DK")} · {j.volumeM3} m³
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className={cn("text-[10px]", JOB_STATUS_COLORS[j.status])}>
                        {JOB_STATUS_LABELS[j.status]}
                      </Badge>
                      <div className="text-xs font-semibold tabular-nums">{dkk(j.revenue)}</div>
                    </div>
                  </div>
                </Card>
              ))
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/jobs" });
              }}
            >
              <Truck className="h-3.5 w-3.5" strokeWidth={1.5} /> Se alle jobs
            </Button>
          </TabsContent>

          <TabsContent value="notes" className="p-5">
            <Field label="Noter">
              <textarea
                className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </Field>
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 mt-auto flex items-center justify-end gap-2 border-t border-border bg-background px-5 py-3">
          <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>Annuller</Button>
          <Button size="sm" onClick={save}>Gem ændringer</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
