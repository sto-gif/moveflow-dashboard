import { createFileRoute } from "@tanstack/react-router";
import { Plus, AlertTriangle, ArrowDownCircle, ArrowUpCircle, ShoppingCart, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { inventory, inventoryLog, lowStockItems, type InventoryCategory } from "@/mocks/inventory";
import { number } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({
    meta: [
      { title: "Lager — Flyt" },
      { name: "description", content: "Flyttekasser, udstyr og køretøjer." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const low = lowStockItems();
  return (
    <div>
      <PageHeader title="Lager" description={`${inventory.length} varer · ${low.length} under minimum`}
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Tilføj vare</Button>} />
      <div className="space-y-4 p-6">
        {low.length > 0 && (
          <Card className="border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <div className="font-semibold text-amber-900">Lager under minimum</div>
                <div className="mt-0.5 text-sm text-amber-800">
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
            <TabsTrigger value="vehicles">Køretøjer</TabsTrigger>
          </TabsList>
          {(["boxes", "equipment", "vehicles"] as InventoryCategory[]).map((cat) => (
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
                        <tr key={i.id} className={cn("border-t hover:bg-muted/40", i.inStorage < i.minStock && "bg-amber-50/40")}>
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
                <h3 className="mb-3 text-sm font-semibold">Bevægelser</h3>
                <div className="space-y-3 text-sm">
                  {inventoryLog.slice(0, 8).map((l) => {
                    const Icon = l.type === "ud" ? ArrowUpCircle : l.type === "ind" ? ArrowDownCircle : l.type === "indkoeb" ? ShoppingCart : XCircle;
                    const tone = l.type === "ud" ? "text-amber-600" : l.type === "ind" ? "text-emerald-600" : l.type === "indkoeb" ? "text-blue-600" : "text-rose-600";
                    return (
                      <div key={l.id} className="flex items-start gap-2 border-b pb-2 last:border-0 last:pb-0">
                        <Icon className={cn("mt-0.5 h-4 w-4", tone)} />
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
        </Tabs>
      </div>
    </div>
  );
}
