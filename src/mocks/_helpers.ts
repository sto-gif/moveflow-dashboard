export const DANISH_FIRST_NAMES = [
  "Lars", "Mette", "Jens", "Anne", "Søren", "Emilie", "Anders", "Karen", "Mikkel",
  "Sofie", "Henrik", "Camilla", "Peter", "Louise", "Thomas", "Maja", "Kasper",
  "Ida", "Rasmus", "Sara", "Christian", "Cecilie", "Morten", "Line", "Niels",
  "Pernille", "Frederik", "Trine", "Magnus", "Sanne", "Jakob", "Helle", "Mads",
  "Anette", "Daniel", "Birgitte", "Mathias", "Lone", "Jonas", "Charlotte",
];

export const DANISH_LAST_NAMES = [
  "Hansen", "Sørensen", "Nielsen", "Pedersen", "Christensen", "Jensen", "Larsen",
  "Andersen", "Rasmussen", "Olsen", "Madsen", "Kristensen", "Jørgensen",
  "Mortensen", "Petersen", "Knudsen", "Holm", "Lund", "Thomsen", "Møller",
];

export const DANISH_CITIES = [
  { city: "København", zip: "1050" },
  { city: "Aarhus", zip: "8000" },
  { city: "Odense", zip: "5000" },
  { city: "Aalborg", zip: "9000" },
  { city: "Esbjerg", zip: "6700" },
  { city: "Randers", zip: "8900" },
  { city: "Kolding", zip: "6000" },
  { city: "Horsens", zip: "8700" },
  { city: "Vejle", zip: "7100" },
  { city: "Roskilde", zip: "4000" },
  { city: "Herning", zip: "7400" },
  { city: "Helsingør", zip: "3000" },
  { city: "Silkeborg", zip: "8600" },
  { city: "Næstved", zip: "4700" },
  { city: "Frederiksberg", zip: "2000" },
];

export const STREETS = [
  "Vesterbrogade", "Nørrebrogade", "Strandvejen", "Algade", "Hovedgaden",
  "Skovvej", "Bredgade", "Søndergade", "Møllevej", "Kirkevej", "Bakkegårdsvej",
  "Lærkevej", "Rosenvej", "Bøgevej", "Egevej", "Stationsvej", "Industrivej",
  "Havnevej", "Parkvej", "Skolegade",
];

/** Stable "today" used across mocks to avoid SSR/client hydration mismatches. */
export const MOCK_TODAY = new Date("2025-04-15T08:00:00.000Z");

let seed = 42;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
/** Reset the PRNG seed so each mock file produces deterministic output
 * regardless of module import order (prevents SSR/client hydration drift). */
export const resetSeed = (s = 42) => {
  seed = s;
};

export const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)]!;
export const randInt = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;
export const randFloat = (min: number, max: number) => rand() * (max - min) + min;

export const randomAddress = () => {
  const c = pick(DANISH_CITIES);
  return {
    street: `${pick(STREETS)} ${randInt(1, 220)}`,
    zip: c.zip,
    city: c.city,
  };
};

export const fullName = () => `${pick(DANISH_FIRST_NAMES)} ${pick(DANISH_LAST_NAMES)}`;

export const phone = () => {
  const n = randInt(20000000, 99999999).toString();
  return `+45 ${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4, 6)} ${n.slice(6, 8)}`;
};

export const email = (name: string) =>
  `${name.toLowerCase().replace(/\s+/g, ".").replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "aa")}@${pick(["gmail.com", "outlook.dk", "hotmail.dk", "live.dk"])}`;

export const daysFromNow = (days: number) => {
  const d = new Date(MOCK_TODAY);
  d.setDate(d.getDate() + days);
  return d;
};
