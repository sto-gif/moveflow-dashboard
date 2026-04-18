import { jobs } from "./jobs";
import { daysFromNow, randInt, resetSeed } from "./_helpers";


resetSeed(2164);
export type VehicleStatus = "tilgaengelig" | "i_brug" | "service";

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  capacityM3: number;
  status: VehicleStatus;
  nextService: Date;
  mileageKm: number;
  driverName?: string;
  notes: string;
}

export const vehicles: Vehicle[] = [
  {
    id: "V-001",
    name: "Mercedes Sprinter",
    plate: "DK 12345",
    capacityM3: 18,
    status: "i_brug",
    nextService: daysFromNow(45),
    mileageKm: 124800,
    driverName: "Lars Hansen",
    notes: "Tip-top stand. Anvendes primært i hovedstadsområdet.",
  },
  {
    id: "V-002",
    name: "MAN TGL 8t",
    plate: "DK 23456",
    capacityM3: 35,
    status: "i_brug",
    nextService: daysFromNow(20),
    mileageKm: 218450,
    driverName: "Mikkel Pedersen",
    notes: "Til større boligflytninger.",
  },
  {
    id: "V-003",
    name: "Volvo FL 12t",
    plate: "DK 34567",
    capacityM3: 50,
    status: "tilgaengelig",
    nextService: daysFromNow(7),
    mileageKm: 312000,
    notes: "Skal til service inden for 7 dage.",
  },
  {
    id: "V-004",
    name: "Iveco Daily",
    plate: "DK 45678",
    capacityM3: 14,
    status: "i_brug",
    nextService: daysFromNow(60),
    mileageKm: 88200,
    driverName: "Jonas Møller",
    notes: "Lille smidig bil — perfekt til indre by.",
  },
  {
    id: "V-005",
    name: "Scania P-serie 18t",
    plate: "DK 56789",
    capacityM3: 65,
    status: "service",
    nextService: daysFromNow(2),
    mileageKm: 410500,
    notes: "På værksted — hovedeftersyn.",
  },
  {
    id: "V-006",
    name: "Ford Transit",
    plate: "DK 67890",
    capacityM3: 12,
    status: "tilgaengelig",
    nextService: daysFromNow(80),
    mileageKm: 67400,
    notes: "Backup-bil til mindre opgaver.",
  },
];

export const vehicleAssignments = vehicles.map((v) => {
  const upcoming = jobs
    .filter((j) => j.date.getTime() >= Date.now() - 86400000)
    .slice(randInt(0, 8), randInt(8, 14))
    .slice(0, 4)
    .map((j) => ({
      jobId: j.id,
      jobNumber: j.number,
      customerName: j.customerName,
      date: j.date,
      route: `${j.origin.city} → ${j.destination.city}`,
    }));
  return { vehicleId: v.id, upcoming };
});

export const vehicleById = (id: string) => vehicles.find((v) => v.id === id);
