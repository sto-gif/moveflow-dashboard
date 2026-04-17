import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { tasks, TASK_STATUS_LABELS, TASK_PRIORITY_COLORS, type TaskStatus } from "@/mocks/tasks";
import { crew } from "@/mocks/crew";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [
      { title: "Opgaver — Flyt" },
      { name: "description", content: "Interne opgaver, deadlines og ansvar." },
    ],
  }),
  component: TasksPage,
});

const STATUSES: TaskStatus[] = ["todo", "i_gang", "afventer", "faerdig"];

function TasksPage() {
  return (
    <div>
      <PageHeader title="Opgaver" description={`${tasks.length} interne opgaver`}
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Ny opgave</Button>} />
      <div className="p-6">
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="table">Tabel</TabsTrigger>
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban" className="mt-4">
            <div className="grid gap-3 lg:grid-cols-4">
              {STATUSES.map((s) => {
                const items = tasks.filter((t) => t.status === s);
                return (
                  <div key={s} className="rounded-lg bg-muted/40 p-2.5">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{TASK_STATUS_LABELS[s]}</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{items.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {items.map((t) => {
                        const m = crew.find((c) => c.id === t.assigneeId);
                        return (
                          <Card key={t.id} className="p-3">
                            <div className="text-sm font-medium leading-snug">{t.title}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <Badge variant="outline" className={cn("text-[10px]", TASK_PRIORITY_COLORS[t.priority])}>{t.priority}</Badge>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">{t.dueDate.toLocaleDateString("da-DK", { day: "numeric", month: "short" })}</span>
                                <div className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold", m?.avatarColor)}>{m?.initials}</div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="table" className="mt-4">
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5">Opgave</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Prioritet</th>
                    <th className="px-4 py-2.5">Ansvarlig</th>
                    <th className="px-4 py-2.5">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => {
                    const m = crew.find((c) => c.id === t.assigneeId);
                    return (
                      <tr key={t.id} className="border-t hover:bg-muted/40">
                        <td className="px-4 py-2.5 font-medium">{t.title}</td>
                        <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{TASK_STATUS_LABELS[t.status]}</Badge></td>
                        <td className="px-4 py-2.5"><Badge variant="outline" className={cn("text-[10px]", TASK_PRIORITY_COLORS[t.priority])}>{t.priority}</Badge></td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold", m?.avatarColor)}>{m?.initials}</div>
                            <span>{t.assigneeName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">{t.dueDate.toLocaleDateString("da-DK")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            <Card className="p-8 text-center text-sm text-muted-foreground">
              Kalendervisning over opgaver kommer her — grupperet efter deadline.
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
