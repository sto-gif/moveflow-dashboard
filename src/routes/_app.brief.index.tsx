import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Send, FileText, CheckCircle2, List, Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { type BriefStatus } from "@/mocks/briefs";
import { useMockStore } from "@/store/mock-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/brief/")({
  head: () => ({
    meta: [
      { title: "Daglig Brief — Movena" },
      { name: "description", content: "Den digitale 06:00-tavle: jobs, crew, biler og noter samlet." },
    ],
  }),
  component: BriefPage,
});

const STATUS: Record<BriefStatus, { label: string; cls: string; icon: any }> = {
  udkast: { label: "Udkast", cls: "bg-slate-100 text-slate-700 border-slate-200", icon: FileText },
  sendt: { label: "Sendt", cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Send },
  afsluttet: { label: "Afsluttet", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

function BriefPage() {
  const { briefs, createBrief } = useMockStore();
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader
        title="Daglig Brief"
        description="Den digitale morgentavle — jobs, crew og biler i ét overblik."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const b = createBrief();
              toast.success("Brief oprettet");
              navigate({ to: "/brief/$briefId", params: { briefId: b.id } });
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} /> Opret ny brief
          </Button>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="liste">
          <TabsList>
            <TabsTrigger value="liste"><List className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Liste</TabsTrigger>
            <TabsTrigger value="kalender"><CalendarIcon className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Kalender</TabsTrigger>
          </TabsList>

          <TabsContent value="liste" className="mt-4">
            <Card className="overflow-auto max-h-[calc(100vh-280px)]">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 sticky top-0 z-10">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">Dato</th>
                    <th className="px-4 py-2.5">Titel</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Jobs</th>
                    <th className="px-4 py-2.5">Crew</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Forfatter</th>
                  </tr>
                </thead>
                <tbody>
                  {briefs.map((b) => {
                    const S = STATUS[b.status];
                    return (
                      <tr
                        key={b.id}
                        onClick={() => navigate({ to: "/brief/$briefId", params: { briefId: b.id } })}
                        className="cursor-pointer border-t hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-medium">
                          {b.date.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" })}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-primary hover:underline">{b.title}</td>
                        <td className="px-4 py-2.5 capitalize text-muted-foreground">{b.scope}</td>
                        <td className="px-4 py-2.5">{b.jobsCount}</td>
                        <td className="px-4 py-2.5">{b.crewCount}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={cn("gap-1 text-[10px]", S.cls)}>
                            <S.icon className="h-3 w-3" strokeWidth={1.5} /> {S.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{b.author}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="kalender" className="mt-4">
            <Card className="p-5">
              <BriefMonth briefs={briefs} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BriefMonth({ briefs }: { briefs: { id: string; title: string; date: Date }[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const briefForDay = (d: number) =>
    briefs.find((b) => b.date.getMonth() === month && b.date.getDate() === d);

  return (
    <div>
      <h3 className="mb-3 text-section">{firstDay.toLocaleDateString("da-DK", { month: "long", year: "numeric" })}</h3>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border text-xs">
        {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => (
          <div key={d} className="bg-muted px-2 py-1.5 font-semibold uppercase tracking-wide">{d}</div>
        ))}
        {cells.map((d, i) => {
          const b = d ? briefForDay(d) : null;
          return (
            <div key={i} className="min-h-[80px] bg-background p-1.5">
              {d && (
                <>
                  <div className={cn("text-[11px] font-semibold", d === today.getDate() && "text-primary")}>{d}</div>
                  {b && (
                    <Link
                      to="/brief/$briefId"
                      params={{ briefId: b.id }}
                      className="mt-1 block w-full truncate rounded bg-primary/10 px-1 py-0.5 text-left text-[10px] text-primary hover:bg-primary/15"
                    >
                      {b.title}
                    </Link>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
