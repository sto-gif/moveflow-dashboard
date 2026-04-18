import { resetSeed } from "./_helpers";
resetSeed(1776);

export interface MovingPackage {
  id: string;
  name: string;
  tagline: string;
  basePrice: number;
  features: string[];
  recommended?: boolean;
}

export const movingPackages: MovingPackage[] = [
  {
    id: "pkg-basis",
    name: "Basis Flytning",
    tagline: "Til den enkle flytning",
    basePrice: 6500,
    features: [
      "2 mand + flyttebil",
      "Op til 4 timer",
      "Inkl. møbeltæpper og stropper",
      "Standard forsikring",
    ],
  },
  {
    id: "pkg-komplet",
    name: "Komplet Flytning",
    tagline: "Mest populære valg",
    basePrice: 12500,
    recommended: true,
    features: [
      "3 mand + stor flyttebil",
      "Op til 8 timer",
      "Demontering og montering",
      "Udvidet forsikring",
      "Pakkemateriale inkluderet",
    ],
  },
  {
    id: "pkg-premium",
    name: "Premium med Pakning",
    tagline: "Helhedsløsning — vi gør det hele",
    basePrice: 22500,
    features: [
      "4 mand + 2 flyttebiler",
      "Fuld pakkeservice",
      "Demontering, montering og opstilling",
      "Topforsikring 500.000 kr.",
      "Slutrengøring inkluderet",
      "Personlig flyttekonsulent",
    ],
  },
];
