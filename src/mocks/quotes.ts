import { customers } from "./customers";
import { pick, randInt, daysFromNow } from "./_helpers";

export type QuoteStatus = "udkast" | "sendt" | "accepteret" | "udløbet" | "afvist";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  udkast: "Udkast",
  sendt: "Sendt",
  accepteret: "Accepteret",
  udløbet: "Udløbet",
  afvist: "Afvist",
};

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  udkast: "bg-slate-100 text-slate-700",
  sendt: "bg-blue-100 text-blue-700",
  accepteret: "bg-emerald-100 text-emerald-700",
  udløbet: "bg-amber-100 text-amber-700",
  afvist: "bg-rose-100 text-rose-700",
};

export interface Quote {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  status: QuoteStatus;
  total: number;
  volumeM3: number;
  distanceKm: number;
  crewSize: number;
  floor: number;
  extras: string[];
  createdAt: Date;
  validUntil: Date;
}

const EXTRAS = ["Pakning", "Opbevaring", "Klaver", "Forsikring +", "Nedpakning af køkken", "Demontering"];

export const quotes: Quote[] = Array.from({ length: 28 }, (_, i) => {
  const customer = pick(customers);
  const status: QuoteStatus = pick(["udkast", "sendt", "sendt", "accepteret", "udløbet", "afvist"] as QuoteStatus[]);
  const volumeM3 = randInt(10, 80);
  const distanceKm = randInt(5, 350);
  const crewSize = randInt(2, 5);
  const extrasCount = randInt(0, 3);
  const extras = Array.from(new Set(Array.from({ length: extrasCount }, () => pick(EXTRAS))));
  const total = volumeM3 * 450 + distanceKm * 18 + crewSize * 1200 + extras.length * 1500;
  return {
    id: `Q-${String(3000 + i).padStart(4, "0")}`,
    number: String(200 + i),
    customerId: customer.id,
    customerName: customer.name,
    status,
    total,
    volumeM3,
    distanceKm,
    crewSize,
    floor: randInt(0, 4),
    extras,
    createdAt: daysFromNow(-randInt(1, 45)),
    validUntil: daysFromNow(randInt(-10, 30)),
  };
});
