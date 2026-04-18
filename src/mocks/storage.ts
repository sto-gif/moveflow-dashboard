import { customers } from "./customers";
import { pick, randInt, daysFromNow, resetSeed } from "./_helpers";


resetSeed(1970);
export type StorageStatus = "aktiv" | "afsluttet" | "afventer";

export interface StorageUnit {
  id: string;
  unitNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  status: StorageStatus;
  monthlyPrice: number;
  contract: string;
  sizeM3: number;
  location: string;
  notes: string;
}

const DESCRIPTIONS = [
  "Møbler fra 3-vær. lejlighed",
  "Kontorinventar — 12 arbejdsstationer",
  "Sommerhusmøbler under renovering",
  "Privat opbevaring — flyttekasser og tøj",
  "Hvidevarer og elektronik",
  "Klaver + sofaer + reoler",
  "Arkivkasser og dokumenter",
  "Have- og udemøbler",
  "Sengetøj, garderobe, husholdning",
  "Kunst og billeder, sart gods",
];

const LOCATIONS = ["Lager A — Herlev", "Lager B — Glostrup", "Lager C — Brøndby"];

const NOTES = [
  "Kunde har egen nøgle — kontakt før besøg",
  "Sart gods — håndteres med forsigtighed",
  "Tung last på paller, kræver gaffeltruck",
  "Forsikret op til 250.000 kr.",
  "Sæsonopbevaring — afhentes inden 1. juni",
  "Genoptages efter renovering",
  "Faktureres kvartalsvis",
  "Kontaktperson: ægtefælle, +45 30 20 10 00",
  "Ingen bemærkninger",
];

export const storageUnits: StorageUnit[] = Array.from({ length: 22 }, (_, i) => {
  const customer = pick(customers);
  const startOffset = -randInt(10, 600);
  const isActive = randInt(0, 10) > 3;
  const status: StorageStatus = i === 0 ? "afventer" : isActive ? "aktiv" : "afsluttet";
  const sizeM3 = randInt(4, 40);
  return {
    id: `S-${String(7000 + i).padStart(4, "0")}`,
    unitNumber: `U-${String(100 + i).padStart(3, "0")}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    customerAddress: `${customer.address.street}, ${customer.address.zip} ${customer.address.city}`,
    description: pick(DESCRIPTIONS),
    startDate: daysFromNow(startOffset),
    endDate: status === "afsluttet" ? daysFromNow(startOffset + randInt(60, 400)) : null,
    status,
    monthlyPrice: sizeM3 * randInt(85, 140),
    contract: `Kontrakt-${randInt(1000, 9999)}.pdf`,
    sizeM3,
    location: pick(LOCATIONS),
    notes: pick(NOTES),
  };
});
