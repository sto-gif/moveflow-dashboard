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
        <div className={cn("flex items-center px-2 py-1.5", collapsed ? "justify-center px-0" : "gap-2") }>
          {collapsed ? (
            <img src={iconUrl} alt="Movena" className="h-8 w-8" />
          ) : (
            <img src={logoUrl} alt="Movena" className="h-6 w-auto" />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className={cn("overflow-y-auto", collapsed && "items-center px-0")}>
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            {!collapsed && (
              <SidebarGroupLabel className="mb-2 h-5 text-[11px] font-semibold uppercase tracking-wide text-white/60">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className={cn(collapsed && "items-center")}>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild tooltip={item.title} className="h-7 text-[13px] text-white/85 transition-colors duration-100 hover:bg-white/10 hover:text-white">
                        <Link
                          to={item.url}
                          className={cn(
                            "relative flex items-center gap-1.5 rounded-md",
                            collapsed && "w-full justify-center gap-0",
                            active && "bg-white/15 font-medium text-white hover:bg-white/15 hover:text-white",
                          )}
                        >
                          {active && !collapsed && (
                            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-white" />
                          )}
                          <item.icon className={cn("h-3.5 w-3.5 shrink-0", active && "text-white")} strokeWidth={1.5} />
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
