import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, AlertTriangle, ArrowDownCircle, ArrowUpCircle, ShoppingCart, XCircle, Sparkles, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "@/components/page-header";
import { inventory, inventoryLog, lowStockItems, lentItems, overdueLentItems, type MaterialCategory, type MaterialItem, type InventoryLog } from "@/mocks/inventory";
import { number } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type MovementType = "ud" | "ind" | "indkoeb" | "tabt";
const MOVEMENT_LABELS: Record<MovementType, string> = { ud: "Ud", ind: "Ind", indkoeb: "Indkøb", tabt: "Tabt" };

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({
    meta: [
      { title: "Materialer — Movena" },
      { name: "description", content: "Flyttekasser og udstyr — register, udlån og forbrug." },
    ],
  }),
  component: MaterialsPage,
});

function MaterialsPage() {
  const low = lowStockItems();
  const overdue = overdueLentItems();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [extraLog, setExtraLog] = useState<InventoryLog[]>([]);
  const allLogs = useMemo(() => [...extraLog, ...inventoryLog], [extraLog]);
  const selected = inventory.find((i) => i.id === selectedId) ?? null;
  return (
    <div>
      <PageHeader
        title="Materialer"
        description={`${inventory.length} varer · ${low.length} under minimum · ${lentItems.length} udlån (${overdue.length} forfaldne)`}
        actions={
          <>
            <NewMaterialDialog />
            <Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Tilføj vare</Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        {low.length > 0 && (
          <Card className="border-warning/40 bg-warning/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" strokeWidth={1.5} />
              <div className="flex-1">
                <div className="font-semibold">Materialer under minimum</div>
                <div className="mt-0.5 text-sm">
                  {low.map((i) => `${i.name} (${i.inStorage} ${i.unit})`).join(", ")}
                </div>
              </div>
              <Button size="sm" variant="outline">Bestil</Button>
            </div>
          </Card>
        )}

        <Tabs defaultValue="boxes">
          <TabsList>
            <TabsTrigger value="boxes">Flyttekasser</TabsTrigger>
            <TabsTrigger value="equipment">Udstyr</TabsTrigger>
            <TabsTrigger value="lent">Udlån ({lentItems.length})</TabsTrigger>
          </TabsList>

          {(["boxes", "equipment"] as MaterialCategory[]).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="overflow-auto max-h-[calc(100vh-280px)]">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 sticky top-0 z-10">
                      <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-2.5">Navn</th>
                        <th className="px-4 py-2.5 text-right">Ejet</th>
                        <th className="px-4 py-2.5 text-right">På lager</th>
                        <th className="px-4 py-2.5 text-right">Ude</th>
                        <th className="px-4 py-2.5 text-right">Tabt</th>
                        <th className="px-4 py-2.5 text-right">Køb i år</th>
                        <th className="px-4 py-2.5 text-right">Min.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.filter((i) => i.category === cat).map((i) => (
                        <tr
                          key={i.id}
                          onClick={() => setSelectedId(i.id)}
                          className={cn("cursor-pointer border-t hover:bg-muted/40 transition-colors", i.inStorage < i.minStock && "bg-warning/5")}
                        >
                          <td className="px-4 py-2.5 font-medium">{i.name}</td>
                          <td className="px-4 py-2.5 text-right">{number(i.owned)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">{number(i.inStorage)}</td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground">{number(i.out)}</td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground">{number(i.lost)}</td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground">{number(i.purchasedThisYear)}</td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground">{number(i.minStock)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
              <Card className="p-5 h-fit">
                <h3 className="mb-3 text-section">Bevægelser</h3>
                <div className="space-y-3 text-sm">
                  {allLogs.slice(0, 8).map((l) => {
                    const Icon = l.type === "ud" ? ArrowUpCircle : l.type === "ind" ? ArrowDownCircle : l.type === "indkoeb" ? ShoppingCart : XCircle;
                    const tone = l.type === "ud" ? "text-warning" : l.type === "ind" ? "text-success" : l.type === "indkoeb" ? "text-primary" : "text-destructive";
                    return (
                      <div key={l.id} className="flex items-start gap-2 border-b pb-2 last:border-0 last:pb-0">
                        <Icon className={cn("mt-0.5 h-4 w-4", tone)} strokeWidth={1.5} />
                        <div className="flex-1">
                          <div className="font-medium">{l.itemName} <span className="text-muted-foreground">({l.qty})</span></div>
                          <div className="text-xs text-muted-foreground">{l.note}</div>
                          <div className="text-[11px] text-muted-foreground">{l.date.toLocaleDateString("da-DK")}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          ))}

          <TabsContent value="lent" className="mt-4">
            <Card className="overflow-auto max-h-[calc(100vh-280px)]">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 sticky top-0 z-10">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">Vare</th>
                    <th className="px-4 py-2.5">Antal</th>
                    <th className="px-4 py-2.5">Lånt af kunde</th>
                    <th className="px-4 py-2.5">Udlånsdato</th>
                    <th className="px-4 py-2.5">Returdato</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lentItems.map((l) => {
                    const isOverdue = l.returnDeadline.getTime() < Date.now();
                    return (
                      <tr key={l.id} className={cn("border-t", isOverdue && "bg-destructive/5")}>
                        <td className="px-4 py-2.5 font-medium">{l.itemName}</td>
                        <td className="px-4 py-2.5">{l.qty}</td>
                        <td className="px-4 py-2.5">{l.customerName}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{l.lentDate.toLocaleDateString("da-DK")}</td>
                        <td className={cn("px-4 py-2.5", isOverdue ? "font-semibold text-destructive" : "text-muted-foreground")}>
                          {l.returnDeadline.toLocaleDateString("da-DK")}
                        </td>
                        <td className="px-4 py-2.5">
                          {isOverdue ? (
                            <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">Forfalden</Badge>
                          ) : (
                            <Badge variant="outline" className="border-success/40 bg-success/10 text-success">Aktiv</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ItemDetailDrawer
        item={selected}
        logs={allLogs}
        open={selected !== null}
        onOpenChange={(o) => { if (!o) setSelectedId(null); }}
        onAddMovement={(entry) => setExtraLog((l) => [entry, ...l])}
      />
    </div>
  );
}

function ItemDetailDrawer({
  item,
  logs,
  open,
  onOpenChange,
  onAddMovement,
}: {
  item: MaterialItem | null;
  logs: InventoryLog[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAddMovement: (entry: InventoryLog) => void;
}) {
  const [type, setType] = useState<MovementType>("ud");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  if (!item) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl" />
      </Sheet>
    );
  }

  const itemLogs = logs.filter((l) => l.itemId === item.id);
  const totals = itemLogs.reduce(
    (acc, l) => {
      acc[l.type] = (acc[l.type] ?? 0) + l.qty;
      return acc;
    },
    {} as Record<MovementType, number>,
  );

  const handleAdd = () => {
    const q = parseInt(qty, 10);
    if (!q || q <= 0) {
      toast.error("Indtast et gyldigt antal");
      return;
    }
    onAddMovement({
      id: `L-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type,
      qty: q,
      date: new Date(),
      note: note.trim() || `Manuel ${MOVEMENT_LABELS[type].toLowerCase()}`,
    });
    setQty("");
    setNote("");
    toast.success(`${MOVEMENT_LABELS[type]} registreret (${q} ${item.unit})`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} /> {item.name}
          </SheetTitle>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px] capitalize">{item.category}</Badge>
            <span className="font-mono">{item.id}</span>
            {item.inStorage < item.minStock && (
              <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">Under minimum</Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="På lager" value={`${number(item.inStorage)} ${item.unit}`} highlight />
            <Stat label="Ude" value={`${number(item.out)} ${item.unit}`} />
            <Stat label="Ejet" value={`${number(item.owned)} ${item.unit}`} />
            <Stat label="Min." value={`${number(item.minStock)} ${item.unit}`} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Indkøb i år" value={number(item.purchasedThisYear)} />
            <Stat label="Tabt total" value={number(totals.tabt ?? item.lost)} />
            <Stat label="Ud (log)" value={number(totals.ud ?? 0)} />
            <Stat label="Ind (log)" value={number(totals.ind ?? 0)} />
          </div>

          <Card className="space-y-3 p-4">
            <h3 className="text-sm font-semibold">Registrer bevægelse</h3>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(MOVEMENT_LABELS) as MovementType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs transition-colors",
                    type === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  {MOVEMENT_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[120px_1fr_auto] gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Antal</Label>
                <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Note</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="f.eks. Job #142" />
              </div>
              <div className="flex items-end">
                <Button size="sm" onClick={handleAdd}>Tilføj</Button>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Bevægelseshistorik ({itemLogs.length})</h3>
            {itemLogs.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Ingen registrerede bevægelser endnu.</div>
            ) : (
              <div className="space-y-2">
                {itemLogs.map((l) => {
                  const Icon = l.type === "ud" ? ArrowUpCircle : l.type === "ind" ? ArrowDownCircle : l.type === "indkoeb" ? ShoppingCart : XCircle;
                  const tone = l.type === "ud" ? "text-warning" : l.type === "ind" ? "text-success" : l.type === "indkoeb" ? "text-primary" : "text-destructive";
                  return (
                    <div key={l.id} className="flex items-start gap-2 border-b pb-2 last:border-0 last:pb-0">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone)} strokeWidth={1.5} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{MOVEMENT_LABELS[l.type]} <span className="text-muted-foreground">· {l.qty} {item.unit}</span></span>
                          <span className="text-[11px] text-muted-foreground tabular-nums">{l.date.toLocaleDateString("da-DK")}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{l.note}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={cn("rounded-md border border-border bg-muted/20 p-3", highlight && "border-primary/30 bg-primary/5")}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function NewMaterialDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Sparkles className="h-4 w-4" strokeWidth={1.5} /> Brugerdefineret type</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opret ny materialetype</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Navn</Label><Input placeholder="f.eks. Plastickasse stor" /></div>
          <div><Label className="text-xs">Enhed</Label><Input placeholder="stk, par, rl…" /></div>
          <div><Label className="text-xs">Minimum lager</Label><Input type="number" placeholder="0" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annullér</Button>
          <Button onClick={() => setOpen(false)}>Opret</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
