// Danish formatting helpers
export const dkk = (amount: number) =>
  new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount);

export const dkkPrecise = (amount: number) =>
  new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
  }).format(amount);

export const number = (n: number) => new Intl.NumberFormat("da-DK").format(n);

export const pct = (n: number) => `${n.toFixed(1).replace(".", ",")}\u00A0%`;
