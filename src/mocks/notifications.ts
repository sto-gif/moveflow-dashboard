import { resetSeed } from "./_helpers";
resetSeed(1679);

export type NotificationType = "alert" | "info" | "warning" | "success";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  meta: string;
  unread: boolean;
  urgent?: boolean;
}

export const notifications: Notification[] = [
  {
    id: "N-1",
    type: "alert",
    title: "Job #2031 starter om 2 timer",
    meta: "Operations · for 5 min. siden",
    unread: true,
    urgent: true,
  },
  {
    id: "N-2",
    type: "warning",
    title: "Kasper Møller har indsendt en ferieansøgning for 14.–18. juli — godkend inden fredag, ellers ryger den i dynamisk planlægning",
    meta: "Crew · for 18 min. siden",
    unread: true,
  },
  {
    id: "N-3",
    type: "info",
    title: "Nyt tilbud anmodet af Lars H.",
    meta: "Salg · for 2 timer siden",
    unread: true,
  },
  {
    id: "N-5",
    type: "warning",
    title: "Lager: Flyttekasser under minimum (18 tilbage)",
    meta: "Lager · i dag 09:14",
    unread: false,
  },
  {
    id: "N-6",
    type: "success",
    title: "Job #2027 markeret færdig",
    meta: "Operations · i går 16:42",
    unread: false,
  },
  {
    id: "N-8",
    type: "info",
    title: "Anne Pedersen accepterede tilbud Q-3155 (23.847 kr)",
    meta: "Salg · i går 10:28",
    unread: false,
  },
  {
    id: "N-9",
    type: "warning",
    title: "Volvo FL 12t skal til service inden for 7 dage — book hos værksted Hansen",
    meta: "Vognpark · i går 09:00",
    unread: false,
  },
  {
    id: "N-10",
    type: "success",
    title: "Ny 5★ anmeldelse fra Søren C.",
    meta: "Marketing · for 2 dage siden",
    unread: false,
  },
];
