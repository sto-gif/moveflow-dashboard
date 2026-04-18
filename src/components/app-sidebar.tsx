import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Briefcase, FileText, Calendar, HardHat,
  CheckSquare, Package, Zap, BarChart3, Settings,
  Truck, Warehouse, Sparkles, UserPlus,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/movena-logo.png";
import iconUrl from "@/assets/movena-icon.svg";

type Item = { title: string; url: string; icon: typeof Users };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Overblik",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Daglig Brief", url: "/brief", icon: Sparkles },
    ],
  },
  {
    label: "Salg",
    items: [
      { title: "Leads", url: "/leads", icon: UserPlus },
      { title: "Kunder", url: "/customers", icon: Users },
      { title: "Tilbud", url: "/quotes", icon: FileText },
    ],
  },
  {
    label: "Drift",
    items: [
      { title: "Jobs", url: "/jobs", icon: Briefcase },
      { title: "Kalender", url: "/calendar", icon: Calendar },
      { title: "Vagtplan", url: "/crew", icon: HardHat },
      { title: "Opgaver", url: "/tasks", icon: CheckSquare },
      { title: "Lager", url: "/lager", icon: Warehouse },
      { title: "Materialer", url: "/inventory", icon: Package },
      { title: "Køretøjer", url: "/koretojer", icon: Truck },
    ],
  },
  {
    label: "Automatisering",
    items: [{ title: "Automatiske Flows", url: "/messages", icon: Zap }],
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
        <div className="flex items-center gap-2 px-2 py-1.5">
          {collapsed ? (
            <img src={iconUrl} alt="Movena" className="h-6 w-6" />
          ) : (
            <img src={logoUrl} alt="Movena" className="h-6 w-auto" />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wide h-6">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild tooltip={item.title} className="h-7 text-[13px]">
                        <Link
                          to={item.url}
                          className={cn(
                            "relative flex items-center gap-1.5 rounded-md",
                            active && "bg-sidebar-accent text-primary font-semibold",
                          )}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r bg-teal" />
                          )}
                          <item.icon className={cn("h-3.5 w-3.5 shrink-0", active && "text-primary")} strokeWidth={1.5} />
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
          <div className="px-2 py-1.5 text-[10px] text-muted-foreground">
            Movena · v1.0
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
