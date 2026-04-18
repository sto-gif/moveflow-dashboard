import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { jobs } from "@/mocks/jobs";
import { customers } from "@/mocks/customers";
import { dkk, pct } from "@/lib/format";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [
      { title: "Rapporter — Flyt" },
      { name: "description", content: "Forretningsanalyse og lønsomhed." },
    ],
  }),
  component: ReportsPage,
});

const COLORS = ["oklch(0.487 0.214 264)", "oklch(0.62 0.16 152)", "oklch(0.78 0.16 75)", "oklch(0.6 0.22 27)", "oklch(0.55 0.18 305)", "oklch(0.65 0.15 210)"];

function ReportsPage() {
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(); m.setMonth(m.getMonth() - (11 - i));
    return { m: m.toLocaleDateString("da-DK", { month: "short" }), omsætning: 180000 + Math.round(Math.sin(i / 2) * 60000) + i * 12000 };
  });
  const jobsData = revenueData.map((r, i) => ({ m: r.m, jobs: 18 + Math.round(Math.cos(i / 2) * 6) + i }));
  const utilization = revenueData.map((r, i) => ({ m: r.m, p: 60 + Math.round(Math.sin(i / 3) * 12) + i / 2 }));
  const sources = ["Hjemmeside", "Anbefaling", "Google", "Facebook", "Trustpilot", "Telefonopkald"]
    .map((s) => ({ name: s, v: customers.filter((c) => c.source === s).length }));
  const conversion = [
    { stage: "Henvendelse", v: 100 }, { stage: "Tilbud", v: 72 },
    { stage: "Booket", v: 41 }, { stage: "Afsluttet", v: 36 },
  ];

  const profit = jobs.filter((j) => j.status === "afsluttet")
    .map((j) => ({ ...j, margin: j.revenue - j.cost, marginPct: ((j.revenue - j.cost) / j.revenue) * 100 }))
    .sort((a, b) => b.marginPct - a.marginPct).slice(0, 12);

  return (
    <div>
      <PageHeader title="Rapporter" description="Indsigt i forretningen"
        actions={
          <>
            <Select defaultValue="12m">
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Sidste 30 dage</SelectItem>
                <SelectItem value="3m">Sidste 3 mdr.</SelectItem>
                <SelectItem value="6m">Sidste 6 mdr.</SelectItem>
                <SelectItem value="12m">Sidste 12 mdr.</SelectItem>
                <SelectItem value="ytd">År til dato</SelectItem>
                <SelectItem value="custom">Brugerdefineret…</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline">Eksportér PDF</Button>
          </>
        }
      />
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <ChartCard title="Omsætning over tid" subtitle="DKK pr. måned">
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
            <XAxis dataKey="m" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => dkk(Number(v))} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="omsætning" stroke="oklch(0.487 0.214 264)" strokeWidth={2.5} />
          </LineChart>
        </ChartCard>
        <ChartCard title="Jobs udført" subtitle="Pr. måned">
          <BarChart data={jobsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
            <XAxis dataKey="m" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="jobs" fill="oklch(0.487 0.214 264)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Crew-udnyttelse" subtitle="% pr. måned">
          <LineChart data={utilization}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
            <XAxis dataKey="m" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v: any) => pct(Number(v))} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="p" stroke="oklch(0.62 0.16 152)" strokeWidth={2.5} />
          </LineChart>
        </ChartCard>
        <ChartCard title="Kundetilgang pr. kilde">
          <PieChart>
            <Pie data={sources} dataKey="v" nameKey="name" cx="35%" cy="50%" outerRadius={80}>
              {sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, paddingLeft: 12 }}
              formatter={(value: string, entry: any) => (
                <span className="text-xs text-foreground">
                  {value} <span className="text-muted-foreground">({entry?.payload?.v ?? 0})</span>
                </span>
              )}
            />
          </PieChart>
        </ChartCard>
        <ChartCard title="Tilbud → booking konvertering" subtitle="Procent">
          <BarChart data={conversion}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="v" fill="oklch(0.487 0.214 264)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
        <Card className="p-5">
          <h3 className="text-sm font-semibold">Top jobs efter margin</h3>
          <p className="text-xs text-muted-foreground">Lønsomhed pr. afsluttet job</p>
          <div className="mt-3 max-h-[260px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1.5">#</th><th className="py-1.5">Kunde</th>
                  <th className="py-1.5 text-right">Oms.</th><th className="py-1.5 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {profit.map((j) => (
                  <tr key={j.id} className="border-b last:border-0">
                    <td className="py-1.5 font-mono">{j.number}</td>
                    <td className="py-1.5">{j.customerName}</td>
                    <td className="py-1.5 text-right">{dkk(j.revenue)}</td>
                    <td className="py-1.5 text-right font-semibold text-emerald-600">{pct(j.marginPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactElement }) {
  return (
    <Card className="p-5">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <ResponsiveContainer width="100%" height={220}>{children}</ResponsiveContainer>
    </Card>
  );
}
