"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  FolderOpen,
  Calendar,
  Inbox,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Target,
  BookTemplate,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/templates", label: "Modèles", icon: BookTemplate },
  { href: "/business-cards", label: "Cartes de visite", icon: CreditCard },
  { href: "/contacts", label: "Clients", icon: Users },
  { href: "/quotes", label: "Devis", icon: FileText },
  { href: "/invoices", label: "Factures", icon: Receipt },
  { href: "/dossiers", label: "Dossiers", icon: FolderOpen },
  { href: "/calendar", label: "Agenda", icon: Calendar },
  { href: "/inbox", label: "Inbox", icon: Inbox },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              CF
            </div>
            <span className="font-semibold text-sm truncate">
              Caroline Finance
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            CF
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <span key={item.href}>{linkContent}</span>;
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Déconnexion</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">Réduire</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
