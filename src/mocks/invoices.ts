import { jobs } from "./jobs";
import { pick, randInt, daysFromNow } from "./_helpers";

export type InvoiceStatus = "udkast" | "sendt" | "betalt" | "forfalden";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  udkast: "Udkast",
  sendt: "Sendt",
  betalt: "Betalt",
  forfalden: "Forfalden",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  udkast: "bg-slate-100 text-slate-700",
  sendt: "bg-blue-100 text-blue-700",
  betalt: "bg-emerald-100 text-emerald-700",
  forfalden: "bg-rose-100 text-rose-700",
};

export interface Invoice {
  id: string;
  number: string;
  jobId: string;
  customerName: string;
  amount: number;
  cost: number;
  status: InvoiceStatus;
  issuedAt: Date;
  dueAt: Date;
}

export const invoices: Invoice[] = jobs
  .filter((j) => j.status === "afsluttet" || j.status === "bekraeftet")
  .slice(0, 36)
  .map((job, i) => {
    const issued = daysFromNow(-randInt(1, 60));
    const due = new Date(issued);
    due.setDate(due.getDate() + 14);
    const overdue = due < new Date();
    const status: InvoiceStatus = i < 3
      ? "udkast"
      : overdue
        ? pick(["betalt", "betalt", "forfalden"] as InvoiceStatus[])
        : pick(["sendt", "betalt"] as InvoiceStatus[]);
    return {
      id: `I-${String(4000 + i).padStart(4, "0")}`,
      number: String(80 + i),
      jobId: job.id,
      customerName: job.customerName,
      amount: job.revenue,
      cost: job.cost,
      status,
      issuedAt: issued,
      dueAt: due,
    };
  });
