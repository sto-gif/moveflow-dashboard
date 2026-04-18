import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Search, ChevronDown, AlertTriangle, Info, CheckCircle2, AlertCircle, Sparkles, Globe } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMockStore } from "@/store/mock-store";
import type { NotificationType } from "@/mocks/notifications";
import { cn } from "@/lib/utils";

const iconFor = (type: NotificationType) => {
  switch (type) {
    case "alert": return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "warning": return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    default: return <Info className="h-4 w-4 text-blue-600" />;
  }
};

export function Topbar() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useMockStore();
  const [lang, setLang] = useState("da");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur">
      <SidebarTrigger />
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Søg kunder, jobs, fakturaer…"
          className="h-9 pl-8 bg-muted/40 border-transparent focus-visible:bg-background"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/settings"
          className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-orange/30 bg-orange/10 px-2.5 py-1 text-xs font-semibold text-orange hover:bg-orange/15 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          Prøveperiode: 12 dage tilbage
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2 text-xs font-medium">
              <Globe className="h-4 w-4" strokeWidth={1.5} />
              {lang.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuLabel className="text-xs">Sprog</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={lang} onValueChange={setLang}>
              <DropdownMenuRadioItem value="da">Dansk</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[380px] p-0">
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <DropdownMenuLabel className="p-0 text-sm font-semibold">
                Notifikationer
              </DropdownMenuLabel>
              <button
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => markAllNotificationsRead()}
              >
                Markér alle som læst
              </button>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-none border-b px-3 py-3 last:border-b-0",
                    n.unread && "bg-accent/30",
                  )}
                >
                  <div className="mt-0.5">{iconFor(n.type)}</div>
                  <div className="flex-1 space-y-0.5">
                    <p className={cn("text-sm leading-snug", n.unread && "font-semibold")}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{n.meta}</p>
                  </div>
                  {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </DropdownMenuItem>
              ))}
            </div>
            <div className="border-t px-3 py-2 text-center">
              <Link to="/" className="text-xs font-medium text-primary hover:underline">
                Vis alle notifikationer
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  AN
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight md:block">
                <div className="text-xs font-semibold">Anders Nielsen</div>
                <div className="text-[10px] text-muted-foreground">Ejer</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Min konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/settings">Profil</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings">Indstillinger</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings">Abonnement</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log ud</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
