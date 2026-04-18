// Danish formatting helpers
// Show ører only if the amount has a fractional part (realistic mix of round + 0,50 prices)
export const dkk = (amount: number) => {
  const hasFraction = Math.abs(amount - Math.round(amount)) > 0.001;
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(amount);
};

export const dkkPrecise = (amount: number) =>
  new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
  }).format(amount);

export const number = (n: number) => new Intl.NumberFormat("da-DK").format(n);

export const pct = (n: number) => `${n.toFixed(1).replace(".", ",")}\u00A0%`;
