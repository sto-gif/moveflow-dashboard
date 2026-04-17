import { randInt, daysFromNow } from "./_helpers";

export type InventoryCategory = "boxes" | "equipment" | "vehicles";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  owned: number;
  inStorage: number;
  out: number;
  lost: number;
  purchasedThisYear: number;
  minStock: number;
  unit: string;
}

export const inventory: InventoryItem[] = [
  // Boxes
  { id: "INV-001", category: "boxes", name: "Flyttekasse standard", owned: 420, inStorage: 280, out: 122, lost: 18, purchasedThisYear: 200, minStock: 100, unit: "stk" },
  { id: "INV-002", category: "boxes", name: "Bogkasse lille", owned: 240, inStorage: 180, out: 55, lost: 5, purchasedThisYear: 80, minStock: 50, unit: "stk" },
  { id: "INV-003", category: "boxes", name: "Garderobekasse", owned: 90, inStorage: 60, out: 25, lost: 5, purchasedThisYear: 30, minStock: 20, unit: "stk" },
  { id: "INV-004", category: "boxes", name: "Glaskasse m. inddeling", owned: 60, inStorage: 35, out: 22, lost: 3, purchasedThisYear: 15, minStock: 25, unit: "stk" },
  { id: "INV-005", category: "boxes", name: "Pakkepapir (rulle)", owned: 80, inStorage: 18, out: 60, lost: 2, purchasedThisYear: 50, minStock: 25, unit: "rl" },
  // Equipment
  { id: "INV-010", category: "equipment", name: "Sækkevogn", owned: 18, inStorage: 8, out: 9, lost: 1, purchasedThisYear: 4, minStock: 5, unit: "stk" },
  { id: "INV-011", category: "equipment", name: "Møbeltæppe", owned: 140, inStorage: 70, out: 65, lost: 5, purchasedThisYear: 30, minStock: 40, unit: "stk" },
  { id: "INV-012", category: "equipment", name: "Bæresele (par)", owned: 28, inStorage: 14, out: 12, lost: 2, purchasedThisYear: 8, minStock: 8, unit: "par" },
  { id: "INV-013", category: "equipment", name: "Klaverdolly", owned: 4, inStorage: 2, out: 2, lost: 0, purchasedThisYear: 1, minStock: 2, unit: "stk" },
  { id: "INV-014", category: "equipment", name: "Stropper og bånd", owned: 60, inStorage: 35, out: 22, lost: 3, purchasedThisYear: 20, minStock: 15, unit: "stk" },
  { id: "INV-015", category: "equipment", name: "Værktøjskasse komplet", owned: 8, inStorage: 4, out: 4, lost: 0, purchasedThisYear: 2, minStock: 3, unit: "stk" },
  // Vehicles
  { id: "INV-020", category: "vehicles", name: "Mercedes Sprinter (DK 12345)", owned: 1, inStorage: 0, out: 1, lost: 0, purchasedThisYear: 0, minStock: 0, unit: "stk" },
  { id: "INV-021", category: "vehicles", name: "MAN TGL 8t (DK 23456)", owned: 1, inStorage: 0, out: 1, lost: 0, purchasedThisYear: 0, minStock: 0, unit: "stk" },
  { id: "INV-022", category: "vehicles", name: "Volvo FL 12t (DK 34567)", owned: 1, inStorage: 1, out: 0, lost: 0, purchasedThisYear: 0, minStock: 0, unit: "stk" },
  { id: "INV-023", category: "vehicles", name: "Iveco Daily (DK 45678)", owned: 1, inStorage: 0, out: 1, lost: 0, purchasedThisYear: 1, minStock: 0, unit: "stk" },
];

export interface InventoryLog {
  id: string;
  itemId: string;
  itemName: string;
  type: "ud" | "ind" | "indkoeb" | "tabt";
  qty: number;
  date: Date;
  note: string;
}

export const inventoryLog: InventoryLog[] = [
  { id: "L-1", itemId: "INV-001", itemName: "Flyttekasse standard", type: "ud", qty: 40, date: daysFromNow(-1), note: "Job #142 — Familien Hansen" },
  { id: "L-2", itemId: "INV-011", itemName: "Møbeltæppe", type: "ud", qty: 12, date: daysFromNow(-1), note: "Job #142" },
  { id: "L-3", itemId: "INV-001", itemName: "Flyttekasse standard", type: "ind", qty: 35, date: daysFromNow(-2), note: "Job #138 retur" },
  { id: "L-4", itemId: "INV-005", itemName: "Pakkepapir (rulle)", type: "indkoeb", qty: 50, date: daysFromNow(-7), note: "Indkøb fra Pakco A/S" },
  { id: "L-5", itemId: "INV-011", itemName: "Møbeltæppe", type: "tabt", qty: 2, date: daysFromNow(-12), note: "Slidt — kasseret" },
  { id: "L-6", itemId: "INV-013", itemName: "Klaverdolly", type: "ud", qty: 1, date: daysFromNow(0), note: "Job #145 — klaverflytning" },
  { id: "L-7", itemId: "INV-002", itemName: "Bogkasse lille", type: "ud", qty: 25, date: daysFromNow(-3), note: "Job #140" },
  { id: "L-8", itemId: "INV-003", itemName: "Garderobekasse", type: "ind", qty: 8, date: daysFromNow(-4), note: "Retur fra job #137" },
];

export const lowStockItems = () =>
  inventory.filter((i) => i.category !== "vehicles" && i.inStorage < i.minStock);

void randInt;
