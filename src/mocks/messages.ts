import { customers } from "./customers";
import { pick, daysFromNow, randInt, resetSeed } from "./_helpers";


resetSeed(1582);
export type MessageChannel = "sms" | "email";
export type MessageDirection = "ud" | "ind";

export interface Message {
  id: string;
  channel: MessageChannel;
  direction: MessageDirection;
  body: string;
  at: Date;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastAt: Date;
  unread: number;
  messages: Message[];
}

const SNIPPETS_IN = [
  "Hej, kan I bekræfte tidspunktet i morgen?",
  "Tusind tak for en god flytning! Alt forløb perfekt.",
  "Jeg har et spørgsmål om tilbuddet — kan vi tale i dag?",
  "Kan vi flytte datoen til ugen efter?",
  "Glemte at nævne et klaver — er det et problem?",
];
const SNIPPETS_OUT = [
  "Hej! Vi bekræfter ankomst kl. 08:00 i morgen. Vores hold ringer 30 min. før.",
  "Mange tak for din anmeldelse — vi sætter pris på det!",
  "Tilbuddet er sendt på mail. Sig endelig til, hvis du har spørgsmål.",
  "Vi har bekræftet jobbet og sender en påmindelse dagen før.",
  "Klaver kan tilføjes — vi sender et opdateret tilbud i dag.",
];

export const conversations: Conversation[] = customers.slice(0, 14).map((c, i) => {
  const msgs: Message[] = [];
  const count = randInt(2, 6);
  for (let j = 0; j < count; j++) {
    const dir: MessageDirection = j % 2 === 0 ? "ind" : "ud";
    msgs.push({
      id: `M-${i}-${j}`,
      channel: pick(["sms", "email"] as MessageChannel[]),
      direction: dir,
      body: dir === "ind" ? pick(SNIPPETS_IN) : pick(SNIPPETS_OUT),
      at: daysFromNow(-(count - j) - i),
    });
  }
  const last = msgs[msgs.length - 1]!;
  return {
    id: `CONV-${i}`,
    customerId: c.id,
    customerName: c.name,
    lastMessage: last.body,
    lastAt: last.at,
    unread: i < 3 ? randInt(1, 3) : 0,
    messages: msgs,
  };
});

export interface AutoSequence {
  id: string;
  name: string;
  trigger: string;
  channel: MessageChannel;
  enabled: boolean;
  template: string;
}

export const sequences: AutoSequence[] = [
  {
    id: "S-1",
    name: "Bookingbekræftelse",
    trigger: "Når et job bookes",
    channel: "email",
    enabled: true,
    template: "Hej {kunde}, tak for din booking. Vi ses {dato} kl. {tid}.",
  },
  {
    id: "S-2",
    name: "Påmindelse — dagen før",
    trigger: "24 timer før job",
    channel: "sms",
    enabled: true,
    template: "Hej {kunde}! Bare en påmindelse om din flytning i morgen kl. {tid}.",
  },
  {
    id: "S-3",
    name: "Status på flyttedagen",
    trigger: "30 min. før ankomst",
    channel: "sms",
    enabled: true,
    template: "Vi er på vej og forventer ankomst kl. {tid}. Vores holdleder hedder {leder}.",
  },
  {
    id: "S-4",
    name: "Tak for samarbejdet",
    trigger: "Dagen efter afsluttet job",
    channel: "email",
    enabled: true,
    template: "Hej {kunde}, tusind tak for at vælge os. Vi håber, du er glad for resultatet!",
  },
  {
    id: "S-5",
    name: "Anmeldelse — Trustpilot",
    trigger: "3 dage efter job",
    channel: "email",
    enabled: false,
    template: "Vi vil rigtig gerne høre din mening — kan du give os en anmeldelse på Trustpilot?",
  },
];
