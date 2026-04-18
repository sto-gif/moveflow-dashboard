import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown, Briefcase, Users, Wallet, Activity,
  AlertTriangle, Clock, CheckCircle2, FileText, UserPlus, Truck, Package,
  Star, MessageSquare, Send, Receipt, Wrench, Warehouse, Mail, ArrowRight,
  UserCheck, XCircle, Building2,
} from "lucide-react";
import { CreateDialog } from "@/components/create-dialog";
import { useMockStore } from "@/store/mock-store";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Area, ComposedChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { todaysJobs, jobs, JOB_STATUS_LABELS } from "@/mocks/jobs";
import { customers } from "@/mocks/customers";
import { leads, LEAD_STAGE_LABELS } from "@/mocks/leads";
import { crew } from "@/mocks/crew";
import { MOCK_TODAY } from "@/mocks/_helpers";
import { dkk, pct, number } from "@/lib/format";
import { cn } from "@/lib/utils";

const JOB_STATUS_BADGE: Record<string, "success" | "warning" | "neutral" | "error"> = {
  planlagt: "neutral",
  bekraeftet: "warning",
  i_gang: "warning",
  afsluttet: "success",
  annulleret: "error",
};

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Movena" },
      { name: "description", content: "Dagens overblik over jobs, omsætning og crew." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { createJob } = useMockStore();
  const today = todaysJobs();
  const completedThisMonth = jobs.filter(
    (j) => j.status === "afsluttet" && j.date.getMonth() === MOCK_TODAY.getMonth(),
  );
  const revenueMTD = completedThisMonth.reduce((s, j) => s + j.revenue, 0);
  const avgValue = completedThisMonth.length ? revenueMTD / completedThisMonth.length : 0;
  const activeJobs = jobs.filter((j) => j.status === "i_gang" || j.status === "bekraeftet" || j.status === "planlagt").length;
  const conversion =
    (customers.length / Math.max(1, customers.length + leads.length)) * 100;
  const utilization = 78.4;

  // Healthy growing moving company: summer peak, winter dip, slight irregular noise per month
  // Sequence (May → Apr): 165, 195, 220, 235, 210, 190, 175, 145, 140, 160, 185, 199 (k DKK)
  const REV_SEQUENCE = [165, 195, 220, 235, 210, 190, 175, 145, 140, 160, 185, 199];
  const NOISE = [-2, 3, -4, 2, -1, 4, -3, 2, -2, 3, -1, 0]; // ±2-4k jitter
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(MOCK_TODAY);
    m.setMonth(m.getMonth() - (11 - i));
    return {
      m: m.toLocaleDateString("da-DK", { month: "short" }),
      omsætning: (REV_SEQUENCE[i]! + NOISE[i]!) * 1000,
    };
  });

  const funnel = (["ny", "kontaktet", "tilbud_sendt", "forhandling", "vundet", "tabt"] as const).map(
    (s) => ({ name: LEAD_STAGE_LABELS[s], v: leads.filter((l) => l.stage === s).length }),
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`God morgen, Anders — ${today.length} jobs i dag, ${activeJobs} aktive jobs.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.success("Eksport startet")}>Eksportér</Button>
            <CreateDialog
              trigger={<Button size="sm">Nyt job</Button>}
              title="Opret nyt job"
              fields={[
                { name: "customerName", label: "Kunde", defaultValue: "Ny kunde" },
                { name: "volumeM3", label: "Volumen (m³)", type: "number", defaultValue: 30 },
                { name: "revenue", label: "Omsætning (DKK)", type: "number", defaultValue: 18000 },
                { name: "startTime", label: "Starttid", defaultValue: "08:00" },
              ]}
              onSubmit={(v) => {
                const job = createJob({
                  customerName: v.customerName,
                  volumeM3: Number(v.volumeM3) || 30,
                  revenue: Number(v.revenue) || 18000,
                  startTime: v.startTime || "08:00",
                });
                toast.success(`Job #${job.number} oprettet`);
                navigate({ to: "/jobs" });
              }}
            />
          </>
        }
      />
      <div className="space-y-8 p-6">
        {/* Hero KPIs */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link to="/reports"><KpiHero label="Omsætning MTD" value={dkk(revenueMTD)} delta="+12,4 % vs. sidste måned" up icon={Wallet} /></Link>
          <Link to="/jobs"><KpiHero label="Aktive jobs" value={number(activeJobs)} delta={`${today.length} starter i dag`} icon={Briefcase} /></Link>
          <Link to="/jobs"><KpiHero label="Jobs udført" value={number(completedThisMonth.length)} delta="+8 vs. sidste måned" up icon={CheckCircle2} /></Link>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <Link to="/leads"><KpiSmall label="Konvertering" value={pct(conversion)} delta="+1,8 %" up icon={Users} /></Link>
          <Link to="/reports"><KpiSmall label="Snit pr. job" value={dkk(avgValue)} delta="-2,1 %" icon={TrendingUp} /></Link>
          <Link to="/crew"><KpiSmall label="Crew-udnyttelse" value={pct(utilization)} delta="+3,1 %" up icon={Activity} /></Link>
        </div>

        {/* Charts row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-section">Omsætning, sidste 12 mdr.</h3>
                <p className="text-caption text-muted-foreground">DKK pr. måned</p>
              </div>
              <Badge variant="success">+21 % YoY</Badge>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={revenueData}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => dkk(Number(v))}
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E2E8F0" }}
                />
                <Area type="monotone" dataKey="omsætning" stroke="none" fill="url(#revFill)" />
                <Line
                  type="monotone" dataKey="omsætning"
                  stroke="#1D4ED8" strokeWidth={2}
                  dot={{ r: 3, fill: "#1D4ED8" }} activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="mt-3 text-caption text-muted-foreground">
              Omsætning er steget 21 % sammenlignet med sidste år. Sommer er jeres største sæson.
            </p>
          </Card>
          <Card>
            <div className="mb-4">
              <h3 className="text-section">Lead funnel</h3>
              <p className="text-caption text-muted-foreground">Antal leads pr. fase</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnel} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} stroke="#94A3B8" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" fill="#1D4ED8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-3 text-caption text-muted-foreground">
              3 jobs mangler crew-tildeling denne uge.
            </p>
          </Card>
        </div>

        {/* Today + Alerts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-7">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Dagens jobs</h3>
              <Button asChild size="sm" variant="ghost"><Link to="/jobs">Se alle</Link></Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-3 font-medium">Tid</th>
                    <th className="pb-3 font-medium">Job</th>
                    <th className="pb-3 font-medium">Kunde</th>
                    <th className="pb-3 font-medium">Crew</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Værdi</th>
                  </tr>
                </thead>
                <tbody>
                  {(today.length ? today : jobs.slice(0, 6)).map((j) => (
                    <tr
                      key={j.id}
                      className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                      onClick={() => navigate({ to: "/jobs", search: { job: j.id } })}
                    >
                      <td className="py-4 font-mono text-xs">{j.startTime}</td>
                      <td className="py-4 font-medium">#{j.number}</td>
                      <td className="py-4">{j.customerName}</td>
                      <td className="py-4">
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
                      <td className="py-4">
                        <Badge variant={JOB_STATUS_BADGE[j.status]}>
                          {JOB_STATUS_LABELS[j.status]}
                        </Badge>
                      </td>
                      <td className="py-4 text-right font-medium tabular-nums text-[#0F172A]">{dkk(j.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold">Alarmer & deadlines</h3>
            <div className="space-y-3">
              <Link to="/jobs"><Alert icon={AlertTriangle} tone="warn"
                title="Job #142 starter om 2 timer"
                meta="1 medarbejder mangler" /></Link>
              <Link to="/quotes"><Alert icon={Clock} tone="info"
                title="Tilbud Q-3015 udløber i morgen"
                meta="Lars Hansen — 24.500 DKK" /></Link>
              <Link to="/jobs"><Alert icon={CheckCircle2} tone="ok"
                title="Job #138 markeret færdig"
                meta="af Anders · i går 16:42" /></Link>
              <Link to="/lager"><Alert icon={AlertTriangle} tone="warn"
                title="Lager: flyttekasser under min."
                meta="18 stk. tilbage" /></Link>
              <Link to="/brief"><Alert icon={Clock} tone="info"
                title="Daglig brief mangler at blive sendt"
                meta="Send inden 06:00" /></Link>
            </div>
          </Card>
        </div>

        {/* Activity feed */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Seneste aktivitet</h3>
            <Badge variant="secondary" className="text-[10px]">Live</Badge>
          </div>
          <div className="max-h-[360px] overflow-y-auto pr-2 text-sm">
            {[
              { icon: CheckCircle2, tone: "ok", t: "Anne Pedersen accepterede tilbud Q-3015 (24.500 DKK)", time: "5 min" },
              { icon: UserCheck, tone: "info", t: "Mette Sørensen anmodede om fri 24. apr", time: "32 min" },
              { icon: Briefcase, tone: "info", t: "Job #145 oprettet — København → Aarhus, 65 m³", time: "1 t" },
              { icon: Star, tone: "ok", t: "Ny anmeldelse på Trustpilot fra Emilie Jensen (5★)", time: "2 t" },
              { icon: Users, tone: "info", t: "Crew-tildeling ændret på job #142 (Anders → Mikkel)", time: "3 t" },
              { icon: UserPlus, tone: "info", t: "Nyt lead modtaget fra hjemmesiden — Søren Christensen", time: "4 t" },
              { icon: Send, tone: "info", t: "Tilbud Q-3014 sendt til Lars Holm (18.200 DKK)", time: "5 t" },
              { icon: CheckCircle2, tone: "ok", t: "Job #141 markeret som afsluttet — Frederiksberg", time: "6 t" },
              { icon: Receipt, tone: "ok", t: "Faktura F-2204 betalt af Nordisk Logistik ApS", time: "7 t" },
              { icon: Wrench, tone: "warn", t: "Køretøj BIL-04 sendt til service", time: "8 t" },
              { icon: Warehouse, tone: "info", t: "Lager-enhed L-12 udlejet til Camilla Berg", time: "9 t" },
              { icon: Mail, tone: "info", t: "Daglig brief sendt til 7 crew-medlemmer", time: "10 t" },
              { icon: ArrowRight, tone: "info", t: "Lead L-5018 flyttet til Forhandling", time: "12 t" },
              { icon: MessageSquare, tone: "info", t: "Ny besked fra Peter Madsen om flytning 2. maj", time: "14 t" },
              { icon: Clock, tone: "warn", t: "Tilbud Q-3013 udløb — påmindelse sendt", time: "16 t" },
              { icon: Users, tone: "info", t: "Crew-medlem Kasper J. tilføjet til job #144", time: "18 t" },
              { icon: Package, tone: "info", t: "Pakkeordre på 30 flyttekasser leveret", time: "1 d" },
              { icon: Star, tone: "ok", t: "Job #140 fik 5★ anmeldelse fra kunde", time: "1 d" },
              { icon: Building2, tone: "info", t: "Ny kunde oprettet: Bredgade Erhverv ApS", time: "1 d" },
              { icon: XCircle, tone: "danger", t: "Lead L-5012 markeret som tabt — for dyrt", time: "2 d" },
            ].map((a, i) => {
              const Icon = a.icon;
              const toneCls = {
                ok: "bg-[#DCFCE7] text-[#16A34A]",
                warn: "bg-[#FEF3C7] text-[#D97706]",
                danger: "bg-[#FEE2E2] text-[#DC2626]",
                info: "bg-muted text-muted-foreground",
              }[a.tone as "ok" | "warn" | "danger" | "info"];
              return (
                <div key={i} className="flex items-start gap-3 border-b py-3 first:pt-0 last:border-0 last:pb-0">
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", toneCls)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 leading-snug">{a.t}</div>
                  <div className="shrink-0 text-xs text-muted-foreground tabular-nums">{a.time}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiHero({
  label, value, delta, up, icon: Icon,
}: {
  label: string; value: string; delta?: string; up?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="card-interactive p-6">
      <div className="flex items-center justify-between">
        <span className="text-label text-muted-foreground">{label}</span>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-foreground">{value}</div>
      {delta && (
        <div className={cn(
          "mt-2 flex items-center gap-1 text-caption",
          up ? "text-[#16A34A]" : "text-muted-foreground",
        )}>
          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {delta}
        </div>
      )}
    </Card>
  );
}

function KpiSmall({
  label, value, delta, up, icon: Icon,
}: {
  label: string; value: string; delta?: string; up?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="card-interactive">
      <div className="flex items-center justify-between">
        <span className="text-caption text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight tabular-nums text-foreground">{value}</div>
      {delta && (
        <div className={cn(
          "mt-1 text-caption",
          up ? "text-[#16A34A]" : "text-muted-foreground",
        )}>
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
    warn: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
    danger: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
    info: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
    ok: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]",
  }[tone];
  return (
    <div className={cn("flex items-start gap-3 rounded-md border px-3 py-2.5", colors)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 leading-snug">
        <div className="text-body font-semibold">{title}</div>
        <div className="text-caption opacity-75">{meta}</div>
      </div>
    </div>
  );
}
