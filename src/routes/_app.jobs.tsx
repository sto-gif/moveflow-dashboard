import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { RowCount } from "@/components/row-count";
import { FilterBar, FilterChips, type FilterGroup } from "@/components/filter-bar";
import { applyFilters, type FilterValues } from "@/hooks/use-filters";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Image as ImageIcon, Upload, Camera, Building2, User, Mail, Phone, Pencil, LayoutGrid, Table as TableIcon, Calendar as CalendarIcon, Truck, MapPin, CheckCircle2, Circle, Clock, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, type JobStatus, type Job } from "@/mocks/jobs";
import { crew } from "@/mocks/crew";
import { customerById } from "@/mocks/customers";
import { vehicles } from "@/mocks/vehicles";
import { quotes, PRICING_LABELS } from "@/mocks/quotes";
import { dkk } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMockStore } from "@/store/mock-store";
import { CreateDialog } from "@/components/create-dialog";
import { KanbanBoard } from "@/components/kanban-board";
import { StageSelect } from "@/components/stage-select";

const jobsSearchSchema = z.object({
  job: fallback(z.string().optional(), undefined),
  status: fallback(z.string().array(), []).default([]),
  crew: fallback(z.string().array(), []).default([]),
  vehicle: fallback(z.string().array(), []).default([]),
  month: fallback(z.string().array(), []).default([]),
});

export const Route = createFileRoute("/_app/jobs")({
  validateSearch: zodValidator(jobsSearchSchema),
  head: () => ({
    meta: [
      { title: "Jobs — Movena" },
      { name: "description", content: "Planlæg flytteopgaver i kanban, kalender eller tabel." },
    ],
  }),
  component: JobsPage,
});

const STATUSES: JobStatus[] = ["planlagt", "bekraeftet", "i_gang", "afsluttet", "annulleret"];
const MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

function JobsPage() {
  const { jobs, createJob, updateJobStatus } = useMockStore();
  const searchParams = Route.useSearch();
  const jobParam = searchParams.job;
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (jobParam) setSelected(jobParam);
  }, [jobParam]);

  const filterValues: FilterValues = useMemo(
    () => ({
      status: searchParams.status,
      crew: searchParams.crew,
      vehicle: searchParams.vehicle,
      month: searchParams.month,
    }),
    [searchParams.status, searchParams.crew, searchParams.vehicle, searchParams.month],
  );

  const setFilters = (next: FilterValues) => {
    navigate({
      to: "/jobs",
      search: {
        job: jobParam,
        status: next.status ?? [],
        crew: next.crew ?? [],
        vehicle: next.vehicle ?? [],
        month: next.month ?? [],
      },
      replace: true,
    });
  };

  const filterGroups: FilterGroup[] = useMemo(() => {
    const statusC = new Map<string, number>();
    const crewC = new Map<string, number>();
    const monthC = new Map<string, number>();
    const vehicleC = new Map<string, number>();
    jobs.forEach((j) => {
      statusC.set(j.status, (statusC.get(j.status) ?? 0) + 1);
      j.crewIds.forEach((id) => crewC.set(id, (crewC.get(id) ?? 0) + 1));
      const m = String(j.date.getMonth());
      monthC.set(m, (monthC.get(m) ?? 0) + 1);
      const v = j.vehicleId ? "yes" : "no";
      vehicleC.set(v, (vehicleC.get(v) ?? 0) + 1);
    });
    return [
      { key: "status", label: "Status", options: STATUSES.map((s) => ({ value: s, label: JOB_STATUS_LABELS[s], count: statusC.get(s) })) },
      { key: "crew", label: "Crew-medlem", options: crew.map((c) => ({ value: c.id, label: c.name, count: crewC.get(c.id) })) },
      { key: "vehicle", label: "Køretøj tildelt", options: [
        { value: "yes", label: "Ja", count: vehicleC.get("yes") },
        { value: "no", label: "Nej", count: vehicleC.get("no") },
      ] },
      { key: "month", label: "Måned", options: MONTHS.map((label, idx) => ({ value: String(idx), label, count: monthC.get(String(idx)) })).filter((o) => (o.count ?? 0) > 0) },
    ];
  }, [jobs]);

  const filtered = useMemo(() => {
    let list = jobs.filter(
      (j) =>
        j.customerName.toLowerCase().includes(search.toLowerCase()) ||
        j.number.includes(search),
    );
    list = applyFilters(list, filterValues, {
      status: (j) => j.status,
      crew: (j) => j.crewIds,
      vehicle: (j) => (j.vehicleId ? "yes" : "no"),
      month: (j) => String(j.date.getMonth()),
    });
    return list;
  }, [jobs, search, filterValues]);

  const job = jobs.find((j) => j.id === selected);

  const itemsByColumn = STATUSES.reduce((acc, s) => {
    acc[s] = filtered.filter((j) => j.status === s);
    return acc;
  }, {} as Record<JobStatus, Job[]>);

  const closeSheet = () => {
    setSelected(null);
    if (jobParam) navigate({ to: "/jobs", search: { ...searchParams, job: undefined } });
  };

  return (
    <div>
      <PageHeader
        title="Jobs"
        description={`${jobs.length} jobs · ${jobs.filter((j) => j.status === "i_gang").length} i gang`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <Input placeholder="Søg jobs…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-56 pl-8" />
            </div>
            <CreateDialog
              trigger={<Button size="sm"><Plus className="h-4 w-4" strokeWidth={1.5} /> Nyt job</Button>}
              title="Opret nyt job"
              fields={[
                { name: "customerName", label: "Kunde", defaultValue: "Ny kunde" },
                { name: "volumeM3", label: "Volumen (m³)", type: "number", defaultValue: 30 },
                { name: "revenue", label: "Omsætning (DKK)", type: "number", defaultValue: 18000 },
                { name: "startTime", label: "Starttid", defaultValue: "08:00" },
              ]}
              onSubmit={(v) => {
                const j = createJob({
                  customerName: v.customerName,
                  volumeM3: Number(v.volumeM3) || 30,
                  revenue: Number(v.revenue) || 18000,
                  startTime: v.startTime || "08:00",
                });
                toast.success(`Job #${j.number} oprettet`);
              }}
            />
          </>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban"><LayoutGrid className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Kanban</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarIcon className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Kalender</TabsTrigger>
            <TabsTrigger value="table"><TableIcon className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} /> Tabel</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-4">
            <KanbanBoard
              className="grid gap-3 lg:grid-cols-5"
              collapseAfter={10}
              columns={STATUSES.map((s) => ({
                id: s,
                label: JOB_STATUS_LABELS[s],
                items: itemsByColumn[s],
                footer: dkk(itemsByColumn[s].reduce((sum, j) => sum + j.revenue, 0)),
              }))}
              itemsByColumn={itemsByColumn}
              onMove={(id, to) => {
                updateJobStatus(id, to);
                toast.success(`Status: ${JOB_STATUS_LABELS[to]}`);
              }}
              renderCard={(j) => (
                <button type="button" onClick={() => setSelected(j.id)} className="kanban-card block w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-label leading-snug">{j.customerName}</div>
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">#{j.number}</span>
                  </div>
                  <div className="mt-1 text-caption text-muted-foreground">
                    {j.origin.city} → {j.destination.city}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-caption font-semibold tabular-nums">{dkk(j.revenue)}</span>
                    <Badge variant="outline" className="text-[10px] tabular-nums">
                      {j.startTime} · {j.volumeM3} m³
                    </Badge>
                  </div>
                </button>
              )}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <Card className="p-5"><CalendarGrid jobs={jobs} onJobClick={(id) => setSelected(id)} /></Card>
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <Card className="max-h-[640px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Dato</th>
                    <th className="px-4 py-2.5">Kunde</th>
                    <th className="px-4 py-2.5">Rute</th>
                    <th className="px-4 py-2.5">Crew</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Værdi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((j) => (
                    <tr key={j.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setSelected(j.id)}>
                      <td className="px-4 py-2.5 font-mono">{j.number}</td>
                      <td className="px-4 py-2.5">{j.date.toLocaleDateString("da-DK")}</td>
                      <td className="px-4 py-2.5 font-medium">{j.customerName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{j.origin.city} → {j.destination.city}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex -space-x-2">
                          {j.crewIds.slice(0, 3).map((id) => {
                            const m = crew.find((c) => c.id === id);
                            return (
                              <div key={id} className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold", m?.avatarColor)}>
                                {m?.initials}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <StageSelect
                          value={j.status}
                          options={STATUSES}
                          labels={JOB_STATUS_LABELS}
                          colors={JOB_STATUS_COLORS}
                          onChange={(next) => {
                            updateJobStatus(j.id, next);
                            toast.success(`#${j.number}: ${JOB_STATUS_LABELS[next]}`);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">{dkk(j.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <RowCount shown={filtered.length} total={jobs.length} noun="jobs" />
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && closeSheet()}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {job && <JobSheet job={job} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function JobSheet({ job }: { job: Job }) {
  const { updateJob, updateCustomer, customers: storeCustomers } = useMockStore();
  const customer = storeCustomers.find((c) => c.id === job.customerId) ?? customerById(job.customerId);
  const quote = quotes.find((q) => q.customerId === job.customerId);
  const vehicle = vehicles.find((v) => v.id === job.vehicleId);
  const assignedCrew = job.crewIds.map((id) => crew.find((c) => c.id === id)).filter(Boolean) as typeof crew;
  const toggleCrew = (id: string) => {
    const next = job.crewIds.includes(id)
      ? job.crewIds.filter((c) => c !== id)
      : [...job.crewIds, id];
    updateJob(job.id, { crewIds: next });
  };
  const patchCustomer = (patch: Parameters<typeof updateCustomer>[1]) => {
    if (customer) updateCustomer(customer.id, patch);
  };
  const patchAddress = (field: "street" | "zip" | "city", value: string) => {
    if (customer) updateCustomer(customer.id, { address: { ...customer.address, [field]: value } });
  };
  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          Job #{job.number} · {job.customerName}
          <Badge variant="outline" className={cn("text-[10px]", JOB_STATUS_COLORS[job.status])}>{JOB_STATUS_LABELS[job.status]}</Badge>
        </SheetTitle>
      </SheetHeader>
      <Tabs defaultValue="oversigt" className="mt-6">
        <TabsList>
          <TabsTrigger value="oversigt">Oversigt</TabsTrigger>
          <TabsTrigger value="tidslinje"><Clock className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Tidslinje</TabsTrigger>
          <TabsTrigger value="okonomi">Økonomi</TabsTrigger>
          <TabsTrigger value="fotos">
            <ImageIcon className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} /> Fotos ({job.photos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oversigt" className="mt-4 space-y-4">
          {customer && (
            <Card className="border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-1 items-center gap-2">
                  {customer.type === "erhverv"
                    ? <Building2 className="h-4 w-4 text-primary" strokeWidth={1.5} />
                    : <User className="h-4 w-4 text-primary" strokeWidth={1.5} />}
                  <Input
                    value={customer.name}
                    onChange={(e) => patchCustomer({ name: e.target.value })}
                    className="h-8 text-sm font-semibold"
                  />
                </div>
                <Select value={customer.type} onValueChange={(v) => patchCustomer({ type: v as typeof customer.type })}>
                  <SelectTrigger className="h-8 w-28 text-xs capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privat">Privat</SelectItem>
                    <SelectItem value="erhverv">Erhverv</SelectItem>
                  </SelectContent>
                </Select>
                <Link
                  to="/customers/$customerId"
                  params={{ customerId: customer.id }}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-primary/30 bg-background px-2 text-[11px] font-medium text-primary hover:bg-primary/10"
                >
                  Se kunde <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Phone className="h-3 w-3" strokeWidth={1.5} /> Telefon</span>
                  <Input value={customer.phone} onChange={(e) => patchCustomer({ phone: e.target.value })} className="h-8 text-xs" />
                </label>
                <label className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Mail className="h-3 w-3" strokeWidth={1.5} /> E-mail</span>
                  <Input value={customer.email} onChange={(e) => patchCustomer({ email: e.target.value })} className="h-8 text-xs" />
                </label>
              </div>
              <div className="grid grid-cols-[1fr_90px_1fr] gap-2">
                <label className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Adresse</span>
                  <Input value={customer.address.street} onChange={(e) => patchAddress("street", e.target.value)} className="h-8 text-xs" />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Postnr.</span>
                  <Input value={customer.address.zip} onChange={(e) => patchAddress("zip", e.target.value)} className="h-8 text-xs" />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">By</span>
                  <Input value={customer.address.city} onChange={(e) => patchAddress("city", e.target.value)} className="h-8 text-xs" />
                </label>
              </div>
              {customer.type === "erhverv" && (
                <label className="block space-y-1">
                  <span className="text-[11px] text-muted-foreground">CVR</span>
                  <Input value={customer.cvr ?? ""} onChange={(e) => patchCustomer({ cvr: e.target.value })} className="h-8 text-xs" />
                </label>
              )}
              <label className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">Noter</span>
                <Textarea
                  value={customer.notes ?? ""}
                  onChange={(e) => patchCustomer({ notes: e.target.value })}
                  className="min-h-[60px] text-xs"
                  placeholder="Tilføj noter om kunden..."
                />
              </label>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-[11px] uppercase text-muted-foreground">Fra</div>
              <div className="mt-1 text-sm font-medium">{job.origin.street}</div>
              <div className="text-xs text-muted-foreground">{job.origin.zip} {job.origin.city}</div>
              <div className="mt-1 text-[11px]">Etage {job.floorOrigin} {job.hasElevatorOrigin ? "· Elevator" : "· Ingen elevator"}</div>
            </Card>
            <Card className="p-3">
              <div className="text-[11px] uppercase text-muted-foreground">Til</div>
              <div className="mt-1 text-sm font-medium">{job.destination.street}</div>
              <div className="text-xs text-muted-foreground">{job.destination.zip} {job.destination.city}</div>
              <div className="mt-1 text-[11px]">Etage {job.floorDest} {job.hasElevatorDest ? "· Elevator" : "· Ingen elevator"}</div>
            </Card>
          </div>
          <Card className="p-3">
            <div className="mb-2 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <div className="text-xs font-semibold uppercase text-muted-foreground">Køretøj</div>
            </div>
            <Select
              value={job.vehicleId ?? "none"}
              onValueChange={(v) => updateJob(job.id, { vehicleId: v === "none" ? undefined : v })}
            >
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Vælg køretøj" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ingen tildelt</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} · {v.plate} · {v.capacityM3} m³
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {vehicle && (
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div><div className="text-muted-foreground">Nummerplade</div><div className="font-mono font-semibold">{vehicle.plate}</div></div>
                <div><div className="text-muted-foreground">Kapacitet</div><div className="font-semibold">{vehicle.capacityM3} m³</div></div>
                <div><div className="text-muted-foreground">Chauffør</div><div className="font-semibold">{vehicle.driverName ?? "—"}</div></div>
              </div>
            )}
          </Card>
          <Card className="p-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Dato</div>
                <Input
                  type="date"
                  value={job.date.toISOString().slice(0, 10)}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    if (!isNaN(d.getTime())) updateJob(job.id, { date: d });
                  }}
                  className="mt-1 h-8 text-center text-sm font-semibold"
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tid</div>
                <Input
                  type="time"
                  value={job.startTime}
                  onChange={(e) => updateJob(job.id, { startTime: e.target.value })}
                  className="mt-1 h-8 text-center text-sm font-semibold"
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Volumen (m³)</div>
                <Input
                  type="number"
                  min={0}
                  value={job.volumeM3}
                  onChange={(e) => updateJob(job.id, { volumeM3: Number(e.target.value) || 0 })}
                  className="mt-1 h-8 text-center text-sm font-semibold"
                />
              </div>
            </div>
          </Card>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Crew</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                    <Pencil className="mr-1 h-3 w-3" strokeWidth={1.5} /> Rediger
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-2">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase text-muted-foreground">Vælg crew</div>
                  <div className="max-h-72 space-y-1 overflow-y-auto">
                    {crew.map((m) => {
                      const checked = job.crewIds.includes(m.id);
                      return (
                        <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                          <Checkbox checked={checked} onCheckedChange={() => toggleCrew(m.id)} />
                          <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold", m.avatarColor)}>{m.initials}</span>
                          <span className="text-sm">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.crewIds.length === 0 && (
                <div className="text-xs text-muted-foreground">Intet crew tildelt endnu.</div>
              )}
              {job.crewIds.map((id) => {
                const m = crew.find((c) => c.id === id);
                return (
                  <Badge key={id} variant="secondary" className="gap-1.5 py-1">
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold", m?.avatarColor)}>{m?.initials}</span>
                    {m?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Udstyr</div>
            <div className="flex flex-wrap gap-1.5">
              {job.equipment.map((e) => <Badge key={e} variant="outline">{e}</Badge>)}
            </div>
          </div>
          {job.instructions && (
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Særlige instruktioner</div>
              <p className="rounded-md bg-muted p-3 text-sm">{job.instructions}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tidslinje" className="mt-4">
          <JobTimeline job={job} />
        </TabsContent>

        <TabsContent value="fotos" className="mt-4 space-y-4">
          <Card className="border-dashed border-2 p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <div className="mt-2 text-sm font-medium">Træk fotos hertil eller klik for at uploade</div>
            <div className="mt-1 text-xs text-muted-foreground">JPG, PNG · Crew kan også uploade direkte fra mobilappen</div>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => toast.success("Vælg billeder")}><Camera className="h-4 w-4" strokeWidth={1.5} /> Vælg billeder</Button>
          </Card>

          {(["før", "efter"] as const).map((label) => {
            const photos = job.photos.filter((p) => p.label === label);
            if (photos.length === 0) return null;
            return (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">{label === "før" ? "Før flytning" : "Efter flytning"}</div>
                  <Badge variant="secondary" className="text-[10px]">{photos.length}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p) => (
                    <div key={p.id} className="group relative overflow-hidden rounded-md border bg-muted">
                      <img src={p.url} alt={p.caption} className="aspect-square w-full object-cover" loading="lazy" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <div className="text-[10px] font-medium text-white">{p.caption}</div>
                      </div>
                      <Badge className={cn("absolute left-1.5 top-1.5 text-[9px]", label === "før" ? "bg-blue-600" : "bg-emerald-600")}>
                        {label.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {job.photos.length === 0 && (
            <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              Ingen fotos uploadet endnu.
            </div>
          )}
        </TabsContent>

        <TabsContent value="okonomi" className="mt-4 space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Omsætning</div>
                <Input
                  type="number"
                  min={0}
                  value={job.revenue}
                  onChange={(e) => updateJob(job.id, { revenue: Number(e.target.value) || 0 })}
                  className="mt-1 h-9 text-center text-base font-bold"
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Omkostning</div>
                <Input
                  type="number"
                  min={0}
                  value={job.cost}
                  onChange={(e) => updateJob(job.id, { cost: Number(e.target.value) || 0 })}
                  className="mt-1 h-9 text-center text-base font-bold"
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Margin</div>
                <div className="mt-1 flex h-9 items-center justify-center text-base font-bold text-success tabular-nums">{dkk(job.revenue - job.cost)}</div>
              </div>
            </div>
            <div className="mt-2 text-center text-[11px] text-muted-foreground">
              Ændringer synkroniseres på tværs af kanban, tabel og kundekortet.
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Margin %</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {job.revenue > 0 ? (((job.revenue - job.cost) / job.revenue) * 100).toFixed(1) : "0.0"}%
            </div>
          </Card>
          {quote && (
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Oprindeligt tilbud</div>
                  <div className="text-sm font-semibold">Q-{quote.number} · {PRICING_LABELS[quote.pricingModel]}</div>
                </div>
                {quote.manuallyAdjusted && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Justeret</Badge>}
              </div>
              <div className="space-y-1 border-t pt-3 text-xs">
                {quote.lineItems.slice(0, 8).map((li) => (
                  <div key={li.id} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{li.label}</span>
                    <span className="font-mono">{dkk(li.amount)}</span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-semibold">
                  <span>Total tilbudt</span>
                  <span>{dkk(quote.total)}</span>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function JobTimeline({ job }: { job: Job }) {
  const created = new Date(job.date.getTime() - 14 * 24 * 60 * 60 * 1000);
  const confirmed = new Date(job.date.getTime() - 5 * 24 * 60 * 60 * 1000);
  const [startH, startM] = job.startTime.split(":").map(Number);
  const started = new Date(job.date);
  started.setHours(startH ?? 8, startM ?? 0, 0, 0);
  const completed = new Date(started.getTime() + job.estimatedHours * 60 * 60 * 1000);
  const now = new Date();

  const events: { label: string; at: Date; done: boolean; status: JobStatus }[] = [
    { label: "Job oprettet", at: created, done: true, status: "planlagt" },
    { label: "Bekræftet af kunde", at: confirmed, done: ["bekraeftet", "i_gang", "afsluttet"].includes(job.status), status: "bekraeftet" },
    { label: "Job startet", at: started, done: ["i_gang", "afsluttet"].includes(job.status), status: "i_gang" },
    { label: "Job afsluttet", at: completed, done: job.status === "afsluttet", status: "afsluttet" },
  ];
  if (job.status === "annulleret") {
    events.push({ label: "Job annulleret", at: now, done: true, status: "annulleret" });
  }

  const fmt = (d: Date) =>
    d.toLocaleDateString("da-DK", { day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });

  return (
    <Card className="p-5">
      <div className="relative space-y-5 pl-7">
        <div className="absolute left-[10px] top-2 bottom-2 w-px bg-border" />
        {events.map((ev, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-7 top-0 flex h-5 w-5 items-center justify-center">
              {ev.done
                ? <CheckCircle2 className="h-5 w-5 text-success" strokeWidth={2} />
                : <Circle className="h-5 w-5 text-muted-foreground/40" strokeWidth={1.5} />}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className={cn("text-sm font-medium", !ev.done && "text-muted-foreground")}>{ev.label}</div>
                <div className="text-[11px] text-muted-foreground tabular-nums">{fmt(ev.at)}</div>
              </div>
              <Badge variant="outline" className={cn("text-[10px]", JOB_STATUS_COLORS[ev.status])}>
                {JOB_STATUS_LABELS[ev.status]}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4 text-center text-xs">
        <div><MapPin className="mx-auto h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} /><div className="mt-1 text-muted-foreground">Estimeret tid</div><div className="font-semibold">{job.estimatedHours} timer</div></div>
        <div><Clock className="mx-auto h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} /><div className="mt-1 text-muted-foreground">Starttid</div><div className="font-semibold">{job.startTime}</div></div>
        <div><Truck className="mx-auto h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} /><div className="mt-1 text-muted-foreground">Volumen</div><div className="font-semibold">{job.volumeM3} m³</div></div>
      </div>
    </Card>
  );
}

function CalendarGrid({ jobs, onJobClick }: { jobs: Job[]; onJobClick: (id: string) => void }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dayJobs = (d: number) =>
    jobs.filter((j) => j.date.getMonth() === month && j.date.getDate() === d);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-section">{firstDay.toLocaleDateString("da-DK", { month: "long", year: "numeric" })}</h3>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border text-xs">
        {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => (
          <div key={d} className="bg-muted px-2 py-1.5 font-semibold uppercase tracking-wide">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className="min-h-[88px] bg-background p-1.5">
            {d && (
              <>
                <div className={cn("text-[11px] font-semibold", d === today.getDate() && "text-primary")}>{d}</div>
                <div className="mt-1 space-y-0.5">
                  {dayJobs(d).slice(0, 2).map((j) => (
                    <button key={j.id} onClick={() => onJobClick(j.id)} className={cn("block w-full truncate rounded px-1 py-0.5 text-left text-[10px] hover:opacity-80", JOB_STATUS_COLORS[j.status])}>
                      #{j.number} {j.customerName.split(" ")[0]}
                    </button>
                  ))}
                  {dayJobs(d).length > 2 && (
                    <div className="px-1 text-[10px] text-muted-foreground">+{dayJobs(d).length - 2}</div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
