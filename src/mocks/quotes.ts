import { customers } from "./customers";
import { pick, randInt, daysFromNow, resetSeed } from "./_helpers";


resetSeed(1873);
export type QuoteStatus = "udkast" | "sendt" | "accepteret" | "udløbet" | "afvist";
export type PricingModel = "kvm" | "time" | "manuel";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  udkast: "Udkast",
  sendt: "Sendt",
  accepteret: "Accepteret",
  udløbet: "Udløbet",
  afvist: "Afvist",
};

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  udkast: "bg-muted text-muted-foreground border-border",
  sendt: "bg-blue-50 text-blue-700 border-blue-200",
  accepteret: "bg-emerald-50 text-emerald-700 border-emerald-200",
  udløbet: "bg-amber-50 text-amber-800 border-amber-200",
  afvist: "bg-rose-50 text-rose-700 border-rose-200",
};

export const PRICING_LABELS: Record<PricingModel, string> = {
  kvm: "Kvadratmeter (m²)",
  time: "Timepris",
  manuel: "Manuel",
};

export interface QuoteLineItem {
  id: string;
  label: string;
  amount: number;
  category: "base" | "tillæg" | "service" | "transport" | "materialer" | "manuel";
}

export interface Quote {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerType: "privat" | "erhverv";
  status: QuoteStatus;
  pricingModel: PricingModel;
  total: number;
  baseTotal: number;
  manuallyAdjusted: boolean;
  lineItems: QuoteLineItem[];
  packageId?: string;
  // Inputs
  homeSizeM2: number;
  rooms: number;
  propertyType: "lejlighed" | "rækkehus" | "villa";
  volumeM3: number;
  distanceKm: number;
  crewSize: number;
  estimatedHours: number;
  hourlyRate: number;
  floorFrom: number;
  floorTo: number;
  elevatorFrom: boolean;
  elevatorTo: boolean;
  parkingDistanceFrom: number;
  parkingDistanceTo: number;
  heavyItems: number;
  packing: boolean;
  cleaning: boolean;
  storage: boolean;
  disassembly: boolean;
  weekendSurcharge: boolean;
  cvr?: string;
  companyName?: string;
  createdAt: Date;
  validUntil: Date;
}

const PACKAGE_IDS = [undefined, undefined, "pkg-basis", "pkg-komplet", "pkg-premium"];

function buildLineItems(q: Omit<Quote, "id" | "number" | "lineItems" | "total" | "baseTotal" | "manuallyAdjusted">): QuoteLineItem[] {
  const items: QuoteLineItem[] = [];
  if (q.pricingModel === "kvm") {
    const mult = q.propertyType === "lejlighed" ? 1 : q.propertyType === "rækkehus" ? 1.1 : 1.15;
    items.push({ id: "li-1", label: `Grundpris ${q.homeSizeM2} m² (${q.propertyType})`, amount: Math.round(q.homeSizeM2 * 95 * mult), category: "base" });
  } else if (q.pricingModel === "time") {
    items.push({ id: "li-1", label: `${q.estimatedHours}t × ${q.crewSize} mand × ${q.hourlyRate} kr/t`, amount: q.estimatedHours * q.crewSize * q.hourlyRate, category: "base" });
  } else {
    items.push({ id: "li-1", label: "Manuel grundpris", amount: 9500, category: "manuel" });
  }
  if (q.floorFrom > 0 && !q.elevatorFrom) items.push({ id: "li-2", label: `Etagetillæg fra (${q.floorFrom} sal, ingen elevator)`, amount: q.floorFrom * 350, category: "tillæg" });
  if (q.floorTo > 0 && !q.elevatorTo) items.push({ id: "li-3", label: `Etagetillæg til (${q.floorTo} sal, ingen elevator)`, amount: q.floorTo * 350, category: "tillæg" });
  if (q.parkingDistanceFrom > 20) items.push({ id: "li-4", label: `Parkeringstillæg fra (${q.parkingDistanceFrom} m)`, amount: 450, category: "tillæg" });
  if (q.parkingDistanceTo > 20) items.push({ id: "li-5", label: `Parkeringstillæg til (${q.parkingDistanceTo} m)`, amount: 450, category: "tillæg" });
  if (q.heavyItems > 0) items.push({ id: "li-6", label: `Tunge genstande (${q.heavyItems})`, amount: q.heavyItems * 600, category: "tillæg" });
  if (q.packing) items.push({ id: "li-7", label: "Pakkeservice", amount: 2800, category: "service" });
  if (q.disassembly) items.push({ id: "li-8", label: "Demontering & montering", amount: 1200, category: "service" });
  if (q.cleaning) items.push({ id: "li-9", label: "Slutrengøring", amount: 2500, category: "service" });
  if (q.storage) items.push({ id: "li-10", label: "Opbevaring (1. mdr.)", amount: 1500, category: "service" });
  items.push({ id: "li-11", label: `Transport (${q.distanceKm} km)`, amount: q.distanceKm * 18, category: "transport" });
  items.push({ id: "li-12", label: "Pakkemateriale", amount: 600, category: "materialer" });
  if (q.weekendSurcharge) items.push({ id: "li-13", label: "Weekend-/aftentillæg", amount: 1800, category: "tillæg" });
  return items;
}

export const quotes: Quote[] = Array.from({ length: 28 }, (_, i) => {
  const customer = pick(customers);
  const status: QuoteStatus = pick(["udkast", "sendt", "sendt", "accepteret", "udløbet", "afvist"] as QuoteStatus[]);
  const pricingModel: PricingModel = pick(["kvm", "kvm", "time", "manuel"] as PricingModel[]);
  const homeSizeM2 = randInt(45, 220);
  const rooms = Math.max(2, Math.round(homeSizeM2 / 30));
  const propertyType = pick(["lejlighed", "rækkehus", "villa"] as const);
  const partial = {
    customerId: customer.id,
    customerName: customer.name,
    customerType: customer.type,
    status,
    pricingModel,
    homeSizeM2,
    rooms,
    propertyType,
    volumeM3: randInt(10, 80),
    distanceKm: randInt(5, 350),
    crewSize: randInt(2, 5),
    estimatedHours: randInt(4, 12),
    hourlyRate: 595,
    floorFrom: randInt(0, 4),
    floorTo: randInt(0, 4),
    elevatorFrom: Math.random() > 0.5,
    elevatorTo: Math.random() > 0.5,
    parkingDistanceFrom: randInt(0, 60),
    parkingDistanceTo: randInt(0, 60),
    heavyItems: randInt(0, 3),
    packing: Math.random() > 0.5,
    cleaning: Math.random() > 0.7,
    storage: Math.random() > 0.8,
    disassembly: Math.random() > 0.5,
    weekendSurcharge: Math.random() > 0.7,
    cvr: customer.cvr,
    companyName: customer.companyName,
    packageId: pick(PACKAGE_IDS),
    createdAt: daysFromNow(-randInt(1, 45)),
    validUntil: daysFromNow(randInt(-10, 30)),
  };
  const lineItems = buildLineItems(partial as any);
  const baseTotal = lineItems.reduce((s, li) => s + li.amount, 0);
  const manuallyAdjusted = Math.random() > 0.78;
  const total = manuallyAdjusted ? Math.round(baseTotal * (0.92 + Math.random() * 0.12)) : baseTotal;
  // Quote numbers start at 3142 with realistic gaps
  const quoteNumberOffsets = [0, 1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22, 24, 25, 27, 28, 29, 31, 32, 33, 34, 36];
  const quoteNumber = String(3142 + (quoteNumberOffsets[i] ?? i));
  // Non-round adjustments: add small odd amounts so totals don't end in 000/500
  const adjustNoise = [173, 247, 419, 587, 691, 813, 47, 129, 263, 379, 461, 542];
  const noise = adjustNoise[i % adjustNoise.length]!;
  return {
    id: `Q-${String(3000 + i).padStart(4, "0")}`,
    number: quoteNumber,
    ...partial,
    lineItems,
    baseTotal: baseTotal + noise,
    manuallyAdjusted,
    total: (manuallyAdjusted ? total : baseTotal) + noise + (i % 8 === 0 ? 0.5 : 0),
  } as Quote;
});

export const buildQuoteLineItems = buildLineItems;
