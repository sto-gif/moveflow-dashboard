import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, AlertTriangle, ArrowDownCircle, ArrowUpCircle, ShoppingCart, XCircle, Smartphone, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { inventory, inventoryLog, lowStockItems, lentItems, overdueLentItems, type MaterialCategory } from "@/mocks/inventory";
import { number } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  return (
    <div>
      <PageHeader
        title="Materialer"
        description={`${inventory.length} varer · ${low.length} under minimum · ${lentItems.length} udlån (${overdue.length} forfaldne)`}
        actions={
          <>
            <Badge variant="outline" className="gap-1.5 border-success/30 bg-success/5 text-success">
              <Smartphone className="h-3 w-3" strokeWidth={1.5} /> Synkroniseret med mobilapp
            </Badge>
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
                <Card className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
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
                        <tr key={i.id} className={cn("border-t hover:bg-muted/40", i.inStorage < i.minStock && "bg-warning/5")}>
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
                  {inventoryLog.slice(0, 8).map((l) => {
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
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
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
