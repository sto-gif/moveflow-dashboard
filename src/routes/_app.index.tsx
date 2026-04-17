import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp, TrendingDown, Briefcase, Users, Wallet, Activity,
  AlertTriangle, Clock, CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { todaysJobs, jobs, JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "@/mocks/jobs";
import { invoices } from "@/mocks/invoices";
import { customers, STAGE_LABELS } from "@/mocks/customers";
import { crew } from "@/mocks/crew";
import { dkk, pct, number } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Flyt" },
      { name: "description", content: "Dagens overblik over jobs, omsætning og crew." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const today = todaysJobs();
  const completedThisMonth = jobs.filter(
    (j) => j.status === "afsluttet" && j.date.getMonth() === new Date().getMonth(),
  );
  const revenueMTD = completedThisMonth.reduce((s, j) => s + j.revenue, 0);
  const avgValue = completedThisMonth.length ? revenueMTD / completedThisMonth.length : 0;
  const outstanding = invoices
    .filter((i) => i.status === "sendt" || i.status === "forfalden")
    .reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "forfalden");
  const conversion =
    (customers.filter((c) => c.stage === "booket" || c.stage === "afsluttet").length /
      Math.max(1, customers.length)) *
    100;
  const utilization = 78.4;

  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const m = new Date();
    m.setMonth(m.getMonth() - (11 - i));
    return {
      m: m.toLocaleDateString("da-DK", { month: "short" }),
      omsætning: 180000 + Math.round(Math.sin(i / 2) * 60000) + i * 12000,
    };
  });

  const funnel = (["ny_henvendelse", "tilbud_sendt", "booket", "afsluttet", "tabt"] as const).map(
    (s) => ({ name: STAGE_LABELS[s], v: customers.filter((c) => c.stage === s).length }),
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`God morgen, Anders — ${today.length} jobs i dag, ${overdue.length} forfaldne fakturaer.`}
        actions={
          <>
            <Button variant="outline" size="sm">Eksportér</Button>
            <Button size="sm">Nyt job</Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Kpi label="Omsætning MTD" value={dkk(revenueMTD)} delta="+12,4 %" up icon={Wallet} />
          <Kpi label="Jobs udført" value={number(completedThisMonth.length)} delta="+8" up icon={Briefcase} />
          <Kpi label="Crew-udnyttelse" value={pct(utilization)} delta="+3,1 %" up icon={Activity} />
          <Kpi label="Gns. jobværdi" value={dkk(avgValue)} delta="-2,1 %" icon={TrendingUp} />
          <Kpi label="Udestående" value={dkk(outstanding)} delta={`${overdue.length} forfaldne`} warn icon={AlertTriangle} />
          <Kpi label="Konvertering" value={pct(conversion)} delta="+1,8 %" up icon={Users} />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Omsætning, sidste 12 mdr.</h3>
                <p className="text-xs text-muted-foreground">DKK pr. måned</p>
              </div>
              <Badge variant="secondary">+18,2 % YoY</Badge>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 257)" />
                <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 257)"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => dkk(Number(v))}
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid oklch(0.92 0.01 255)" }}
                />
                <Line
                  type="monotone" dataKey="omsætning"
                  stroke="oklch(0.487 0.214 264)" strokeWidth={2.5}
                  dot={{ r: 3 }} activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Lead funnel</h3>
              <p className="text-xs text-muted-foreground">Antal kunder pr. fase</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnel} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 257)" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} stroke="oklch(0.5 0.02 257)" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" fill="oklch(0.487 0.214 264)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Today + Alerts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Dagens jobs</h3>
              <Button size="sm" variant="ghost">Se alle</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-medium">Tid</th>
                    <th className="pb-2 font-medium">Job</th>
                    <th className="pb-2 font-medium">Kunde</th>
                    <th className="pb-2 font-medium">Crew</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Værdi</th>
                  </tr>
                </thead>
                <tbody>
                  {(today.length ? today : jobs.slice(0, 6)).map((j) => (
                    <tr key={j.id} className="border-b last:border-0">
                      <td className="py-2.5 font-mono text-xs">{j.startTime}</td>
                      <td className="py-2.5 font-medium">#{j.number}</td>
                      <td className="py-2.5">{j.customerName}</td>
                      <td className="py-2.5">
                        <div className="flex -space-x-2">
                          {j.crewIds.slice(0, 3).map((id) => {
                            const m = crew.find((c) => c.id === id);
                            return (
                              <div
                                key={id}
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold",
                                  m?.avatarColor,
                                )}
                              >
                                {m?.initials}
                              </div>
                            );
                          })}
                          {j.crewIds.length > 3 && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold">
                              +{j.crewIds.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={cn("text-[10px]", JOB_STATUS_COLORS[j.status])}>
                          {JOB_STATUS_LABELS[j.status]}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-medium">{dkk(j.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold">Alarmer & deadlines</h3>
            <div className="space-y-3">
              <Alert icon={AlertTriangle} tone="warn"
                title="Job #142 starter om 2 timer"
                meta="1 medarbejder mangler" />
              <Alert icon={AlertTriangle} tone="danger"
                title={`${overdue.length} forfaldne fakturaer`}
                meta={dkk(overdue.reduce((s, i) => s + i.amount, 0))} />
              <Alert icon={Clock} tone="info"
                title="Tilbud Q-3015 udløber i morgen"
                meta="Lars Hansen — 24.500 DKK" />
              <Alert icon={CheckCircle2} tone="ok"
                title="Job #138 markeret færdig"
                meta="af Anders · i går 16:42" />
              <Alert icon={AlertTriangle} tone="warn"
                title="Lager: flyttekasser under min."
                meta="18 stk. tilbage" />
            </div>
          </Card>
        </div>

        {/* Activity feed */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Seneste aktivitet</h3>
          <div className="space-y-3 text-sm">
            {[
              "Anne Pedersen accepterede tilbud Q-3015 (24.500 DKK)",
              "Faktura I-4012 betalt af Søren Christensen",
              "Mette Sørensen anmodede om fri 24. apr",
              "Job #145 oprettet — København → Aarhus, 65 m³",
              "Ny anmeldelse på Trustpilot fra Emilie Jensen (5★)",
              "Crew-tildeling ændret på job #142 (Anders → Mikkel)",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="flex-1">{t}</div>
                <div className="text-xs text-muted-foreground">
                  {i === 0 ? "5 min" : i === 1 ? "32 min" : `${i + 1} t`}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  label, value, delta, up, warn, icon: Icon,
}: {
  label: string; value: string; delta?: string; up?: boolean; warn?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", warn ? "text-destructive" : "text-muted-foreground")} />
      </div>
      <div className="mt-2 text-xl font-bold tracking-tight">{value}</div>
      {delta && (
        <div className={cn(
          "mt-1 flex items-center gap-1 text-[11px] font-medium",
          warn ? "text-destructive" : up ? "text-emerald-600" : "text-muted-foreground",
        )}>
          {up ? <TrendingUp className="h-3 w-3" /> : warn ? <AlertTriangle className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta}
        </div>
      )}
    </Card>
  );
}

function Alert({
  icon: Icon, tone, title, meta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "warn" | "danger" | "info" | "ok";
  title: string; meta: string;
}) {
  const colors = {
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }[tone];
  return (
    <div className={cn("flex items-start gap-3 rounded-md border px-3 py-2.5", colors)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 leading-snug">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs opacity-80">{meta}</div>
      </div>
    </div>
  );
}
