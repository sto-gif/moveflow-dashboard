import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Briefcase, FileText, Calendar, HardHat,
  CheckSquare, Package, MessageSquare, Receipt, BarChart3, Settings,
  Truck,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type Item = { title: string; url: string; icon: typeof Users };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Overblik",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Salg",
    items: [
      { title: "Kunder", url: "/customers", icon: Users },
      { title: "Tilbud", url: "/quotes", icon: FileText },
      { title: "Fakturaer", url: "/invoices", icon: Receipt },
    ],
  },
  {
    label: "Drift",
    items: [
      { title: "Jobs", url: "/jobs", icon: Briefcase },
      { title: "Kalender", url: "/calendar", icon: Calendar },
      { title: "Crew", url: "/crew", icon: HardHat },
      { title: "Opgaver", url: "/tasks", icon: CheckSquare },
      { title: "Lager", url: "/inventory", icon: Package },
    ],
  },
  {
    label: "Engagement",
    items: [{ title: "Beskeder", url: "/messages", icon: MessageSquare }],
  },
  {
    label: "Indsigt",
    items: [{ title: "Rapporter", url: "/reports", icon: BarChart3 }],
  },
  {
    label: "Konto",
    items: [{ title: "Indstillinger", url: "/settings", icon: Settings }],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const path = location.pathname;
  const isActive = (url: string) => (url === "/" ? path === "/" : path.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Truck className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">Flyt</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Operations
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link
                          to={item.url}
                          className={cn(
                            "flex items-center gap-2 rounded-md text-sm",
                            active && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2 text-[11px] text-muted-foreground">
            v1.0 · Demo data
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
