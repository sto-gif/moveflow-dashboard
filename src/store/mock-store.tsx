import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { leads as seedLeads, type Lead, type LeadStage } from "@/mocks/leads";
import { customers as seedCustomers, type Customer, type CustomerStage, type CustomerType } from "@/mocks/customers";
import { jobs as seedJobs, type Job, type JobStatus } from "@/mocks/jobs";
import { quotes as seedQuotes, type Quote, type QuoteStatus, buildQuoteLineItems } from "@/mocks/quotes";
import { briefs as seedBriefs, type Brief } from "@/mocks/briefs";
import { notifications as seedNotifications, type Notification } from "@/mocks/notifications";
import { MOCK_TODAY, randomAddress } from "@/mocks/_helpers";

interface Settings {
  companyName: string;
  cvr: string;
  email: string;
  phone: string;
  flowAutoQuote: boolean;
  flowAutoFollowup: boolean;
  flowAutoBrief: boolean;
}

interface Ctx {
  leads: Lead[];
  customers: Customer[];
  jobs: Job[];
  quotes: Quote[];
  briefs: Brief[];
  notifications: Notification[];
  settings: Settings;
  unreadCount: number;
  // leads
  createLead: (input: { name: string; email: string; phone: string; city: string; estimatedValue: number }) => Lead;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  convertLeadToCustomer: (id: string) => Customer | null;
  // customers
  createCustomer: (input: { name: string; email: string; phone: string; type: CustomerType }) => Customer;
  updateCustomerStage: (id: string, stage: CustomerStage) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  // jobs
  createJob: (input: { customerName: string; volumeM3: number; revenue: number; startTime: string }) => Job;
  updateJobStatus: (id: string, status: JobStatus) => void;
  updateJob: (id: string, patch: Partial<Job>) => void;
  // quotes
  createQuote: (input: { customerName: string; total: number; pricingModel?: Quote["pricingModel"] }) => Quote;
  updateQuoteStatus: (id: string, status: QuoteStatus) => void;
  convertQuoteToJob: (id: string) => Job | null;
  // briefs
  createBrief: () => Brief;
  // notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // settings
  updateSettings: (patch: Partial<Settings>) => void;
}

const MockStoreContext = createContext<Ctx | null>(null);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => [...seedLeads]);
  const [customers, setCustomers] = useState<Customer[]>(() => [...seedCustomers]);
  const [jobs, setJobs] = useState<Job[]>(() => [...seedJobs]);
  const [quotes, setQuotes] = useState<Quote[]>(() => [...seedQuotes]);
  const [briefs, setBriefs] = useState<Brief[]>(() => [...seedBriefs]);
  const [notifications, setNotifications] = useState<Notification[]>(() => [...seedNotifications]);
  const [settings, setSettings] = useState<Settings>({
    companyName: "Movena Demo ApS",
    cvr: "38291045",
    email: "kontakt@movena.dk",
    phone: "+45 70 20 30 40",
    flowAutoQuote: true,
    flowAutoFollowup: true,
    flowAutoBrief: false,
  });

  const createLead: Ctx["createLead"] = useCallback((input) => {
    const lead: Lead = {
      id: `L-${String(9000 + Math.floor(Math.random() * 999)).padStart(4, "0")}`,
      name: input.name,
      type: "privat",
      email: input.email,
      phone: input.phone,
      city: input.city,
      stage: "ny",
      source: "Hjemmeside",
      estimatedValue: input.estimatedValue,
      moveDate: new Date(MOCK_TODAY.getTime() + 30 * 86400000),
      createdAt: new Date(MOCK_TODAY),
      note: "Nyt lead oprettet manuelt.",
      owner: "Anders N.",
    };
    setLeads((ls) => [lead, ...ls]);
    return lead;
  }, []);

  const updateLeadStage: Ctx["updateLeadStage"] = useCallback((id, stage) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l)));
  }, []);

  const convertLeadToCustomer: Ctx["convertLeadToCustomer"] = useCallback((id) => {
    const lead = seedLeads.find((l) => l.id === id) ?? leads.find((l) => l.id === id);
    if (!lead) return null;
    const addr = randomAddress();
    const customer: Customer = {
      id: `C-${String(9000 + Math.floor(Math.random() * 999)).padStart(4, "0")}`,
      name: lead.name,
      type: lead.type,
      email: lead.email,
      phone: lead.phone,
      address: { street: `${lead.city} 1`, zip: addr.zip, city: lead.city },
      stage: "booket",
      source: lead.source as Customer["source"],
      value: lead.estimatedValue,
      createdAt: new Date(MOCK_TODAY),
      notes: `Konverteret fra lead ${lead.id}. ${lead.note}`,
      moveCount: 0,
      tags: [],
      previousJobs: [],
      communications: [],
      totalValue: lead.estimatedValue,
    };
    setCustomers((cs) => [customer, ...cs]);
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage: "vundet" } : l)));
    return customer;
  }, [leads]);

  const createCustomer: Ctx["createCustomer"] = useCallback((input) => {
    const addr = randomAddress();
    const customer: Customer = {
      id: `C-${String(9000 + Math.floor(Math.random() * 999)).padStart(4, "0")}`,
      name: input.name,
      type: input.type,
      email: input.email,
      phone: input.phone,
      address: addr,
      stage: "booket",
      source: "Hjemmeside",
      value: 0,
      createdAt: new Date(MOCK_TODAY),
      notes: "Ny kunde oprettet manuelt.",
      moveCount: 0,
      tags: [],
      previousJobs: [],
      communications: [],
      totalValue: 0,
    };
    setCustomers((cs) => [customer, ...cs]);
    return customer;
  }, []);

  const updateCustomerStage: Ctx["updateCustomerStage"] = useCallback((id, stage) => {
    setCustomers((cs) => cs.map((c) => (c.id === id ? { ...c, stage } : c)));
  }, []);

  const createJob: Ctx["createJob"] = useCallback((input) => {
    const num = String(200 + Math.floor(Math.random() * 999));
    const addr = randomAddress();
    const job: Job = {
      id: `J-${String(9000 + Math.floor(Math.random() * 999)).padStart(4, "0")}`,
      number: num,
      customerId: customers[0]?.id ?? "C-1000",
      customerName: input.customerName,
      origin: addr,
      destination: randomAddress(),
      date: new Date(MOCK_TODAY),
      startTime: input.startTime,
      estimatedHours: 6,
      volumeM3: input.volumeM3,
      crewIds: [],
      equipment: ["Flyttebil 35m³", "Møbeltæpper"],
      instructions: "",
      status: "planlagt",
      revenue: input.revenue,
      cost: Math.round(input.revenue * 0.55),
      floorOrigin: 0,
      floorDest: 0,
      hasElevatorOrigin: true,
      hasElevatorDest: true,
      photos: [],
    };
    setJobs((js) => [job, ...js]);
    return job;
  }, [customers]);

  const updateJobStatus: Ctx["updateJobStatus"] = useCallback((id, status) => {
    setJobs((js) => js.map((j) => (j.id === id ? { ...j, status } : j)));
  }, []);

  const updateJob: Ctx["updateJob"] = useCallback((id, patch) => {
    setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const createQuote: Ctx["createQuote"] = useCallback((input) => {
    const lineItems = [
      { id: "li-1", label: "Grundpris", amount: Math.round(input.total * 0.7), category: "base" as const },
      { id: "li-2", label: "Transport", amount: Math.round(input.total * 0.2), category: "transport" as const },
      { id: "li-3", label: "Pakkemateriale", amount: Math.round(input.total * 0.1), category: "materialer" as const },
    ];
    const quote: Quote = {
      id: `Q-${String(9000 + Math.floor(Math.random() * 999)).padStart(4, "0")}`,
      number: String(300 + Math.floor(Math.random() * 999)),
      customerId: customers[0]?.id ?? "C-1000",
      customerName: input.customerName,
      customerType: "privat",
      status: "udkast",
      pricingModel: input.pricingModel ?? "kvm",
      total: input.total,
      baseTotal: input.total,
      manuallyAdjusted: false,
      lineItems,
      homeSizeM2: 95,
      rooms: 3,
      propertyType: "lejlighed",
      volumeM3: 35,
      distanceKm: 18,
      crewSize: 3,
      estimatedHours: 6,
      hourlyRate: 595,
      floorFrom: 1,
      floorTo: 1,
      elevatorFrom: true,
      elevatorTo: true,
      parkingDistanceFrom: 10,
      parkingDistanceTo: 10,
      heavyItems: 0,
      packing: false,
      cleaning: false,
      storage: false,
      disassembly: false,
      weekendSurcharge: false,
      createdAt: new Date(MOCK_TODAY),
      validUntil: new Date(MOCK_TODAY.getTime() + 30 * 86400000),
    };
    setQuotes((qs) => [quote, ...qs]);
    return quote;
  }, [customers]);

  const updateQuoteStatus: Ctx["updateQuoteStatus"] = useCallback((id, status) => {
    setQuotes((qs) => qs.map((q) => (q.id === id ? { ...q, status } : q)));
  }, []);

  const convertQuoteToJob: Ctx["convertQuoteToJob"] = useCallback((id) => {
    const q = quotes.find((x) => x.id === id);
    if (!q) return null;
    const job = createJob({
      customerName: q.customerName,
      volumeM3: q.volumeM3,
      revenue: q.total,
      startTime: "08:00",
    });
    setQuotes((qs) => qs.map((x) => (x.id === id ? { ...x, status: "accepteret" } : x)));
    return job;
  }, [quotes, createJob]);

  const createBrief: Ctx["createBrief"] = useCallback(() => {
    const id = `B-${String(9000 + Math.floor(Math.random() * 999)).padStart(4, "0")}`;
    const brief: Brief = {
      id,
      title: `Brief ${new Date(MOCK_TODAY).toLocaleDateString("da-DK", { day: "numeric", month: "long" })}`,
      date: new Date(MOCK_TODAY),
      scope: "dag",
      status: "udkast",
      author: "Anders Nielsen",
      jobsCount: 3,
      crewCount: 6,
      vehiclesCount: 2,
      generalNotes: "",
      specialInstructions: "",
      breakSchedule: "Frokost 12:00–12:30.",
      announcements: "",
    };
    setBriefs((bs) => [brief, ...bs]);
    return brief;
  }, []);

  const markNotificationRead: Ctx["markNotificationRead"] = useCallback((id) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markAllNotificationsRead: Ctx["markAllNotificationsRead"] = useCallback(() => {
    setNotifications((ns) => ns.map((n) => ({ ...n, unread: false })));
  }, []);

  const updateSettings: Ctx["updateSettings"] = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const value: Ctx = {
    leads, customers, jobs, quotes, briefs, notifications, settings, unreadCount,
    createLead, updateLeadStage, convertLeadToCustomer,
    createCustomer, updateCustomerStage,
    createJob, updateJobStatus, updateJob,
    createQuote, updateQuoteStatus, convertQuoteToJob,
    createBrief,
    markNotificationRead, markAllNotificationsRead,
    updateSettings,
  };

  void buildQuoteLineItems;

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore() {
  const ctx = useContext(MockStoreContext);
  if (!ctx) throw new Error("useMockStore must be used within MockStoreProvider");
  return ctx;
}
