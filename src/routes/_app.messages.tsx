import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Mail, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { conversations, sequences } from "@/mocks/messages";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({
    meta: [
      { title: "Beskeder — Flyt" },
      { name: "description", content: "Kundekommunikation via SMS og email." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const [active, setActive] = useState(conversations[0]?.id ?? "");
  const conv = conversations.find((c) => c.id === active);
  const [seqs, setSeqs] = useState(sequences);

  return (
    <div>
      <PageHeader title="Beskeder" description={`${conversations.length} samtaler · ${conversations.filter((c) => c.unread > 0).length} ulæste`} />
      <div className="p-6">
        <Tabs defaultValue="inbox">
          <TabsList>
            <TabsTrigger value="inbox">Indbakke</TabsTrigger>
            <TabsTrigger value="auto">Automatiske flows</TabsTrigger>
          </TabsList>
          <TabsContent value="inbox" className="mt-4">
            <Card className="grid h-[600px] grid-cols-12 overflow-hidden">
              <div className="col-span-4 overflow-y-auto border-r">
                {conversations.map((c) => (
                  <button key={c.id} onClick={() => setActive(c.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b px-3 py-3 text-left hover:bg-muted/40",
                      active === c.id && "bg-accent",
                    )}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {c.customerName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-sm", c.unread > 0 && "font-semibold")}>{c.customerName}</span>
                        <span className="text-[10px] text-muted-foreground">{c.lastAt.toLocaleDateString("da-DK", { day: "numeric", month: "short" })}</span>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{c.lastMessage}</div>
                      {c.unread > 0 && <Badge className="mt-1 h-4 px-1.5 text-[9px]">{c.unread}</Badge>}
                    </div>
                  </button>
                ))}
              </div>
              <div className="col-span-8 flex flex-col">
                {conv ? (
                  <>
                    <div className="border-b px-4 py-3">
                      <div className="font-semibold">{conv.customerName}</div>
                      <div className="text-xs text-muted-foreground">Aktiv samtale · SMS + Email</div>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
                      {conv.messages.map((m) => (
                        <div key={m.id} className={cn("flex", m.direction === "ud" ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                            m.direction === "ud" ? "bg-primary text-primary-foreground" : "bg-background border",
                          )}>
                            <div className="mb-1 flex items-center gap-1.5 text-[10px] opacity-70">
                              {m.channel === "sms" ? <MessageSquare className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                              {m.channel.toUpperCase()} · {m.at.toLocaleDateString("da-DK", { day: "numeric", month: "short" })}
                            </div>
                            {m.body}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t bg-background p-3">
                      <div className="flex gap-2">
                        <Input placeholder="Skriv en besked…" className="h-9" />
                        <Button size="sm"><Send className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Vælg en samtale</div>
                )}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="auto" className="mt-4 space-y-3">
            {seqs.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {s.channel === "sms" ? <><MessageSquare className="mr-1 h-3 w-3" />SMS</> : <><Mail className="mr-1 h-3 w-3" />Email</>}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">Trigger: {s.trigger}</div>
                    <div className="mt-2 rounded bg-muted px-3 py-2 text-sm text-muted-foreground">{s.template}</div>
                  </div>
                  <Switch checked={s.enabled} onCheckedChange={(v) => setSeqs(seqs.map((x) => x.id === s.id ? { ...x, enabled: v } : x))} />
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
