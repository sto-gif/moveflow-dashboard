export type NotificationType = "alert" | "info" | "warning" | "success";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  meta: string;
  unread: boolean;
}

export const notifications: Notification[] = [
  {
    id: "N-1",
    type: "warning",
    title: "Job #142 starter om 2 timer — 1 medarbejder mangler",
    meta: "Operations · for 5 min. siden",
    unread: true,
  },
  {
    id: "N-3",
    type: "info",
    title: "Nyt tilbud anmodet af Lars Hansen",
    meta: "Salg · for 2 timer siden",
    unread: true,
  },
  {
    id: "N-4",
    type: "info",
    title: "Mette Sørensen har anmodet om fri 24. april",
    meta: "Crew · for 3 timer siden",
    unread: false,
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
    title: "Job #138 markeret som færdig af crew leader Anders",
    meta: "Operations · i går 16:42",
    unread: false,
  },
  {
    id: "N-8",
    type: "info",
    title: "Anne Pedersen har accepteret tilbud Q-3015",
    meta: "Salg · i går 10:28",
    unread: false,
  },
  {
    id: "N-9",
    type: "warning",
    title: "Volvo FL 12t skal til service inden for 7 dage",
    meta: "Lager · i går 09:00",
    unread: false,
  },
  {
    id: "N-10",
    type: "info",
    title: "Ny anmeldelse på Trustpilot fra Søren Christensen (5★)",
    meta: "Marketing · for 2 dage siden",
    unread: false,
  },
];
