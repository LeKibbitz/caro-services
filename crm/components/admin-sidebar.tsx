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
  MessageCircle,
  Truck,
  Mail,
  GripVertical,
  HelpCircle,
  GitBranch,
  Tag,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, Modifier } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, tourId: "dashboard" },
  { href: "/workflows", label: "Workflows", icon: GitBranch, tourId: undefined },
  { href: "/leads", label: "Leads", icon: Target, tourId: "leads" },
  { href: "/templates", label: "Modèles", icon: BookTemplate, tourId: undefined },
  { href: "/business-cards", label: "Cartes de visite", icon: CreditCard, tourId: undefined },
  { href: "/contacts", label: "Clients", icon: Users, tourId: "contacts" },
  { href: "/quotes", label: "Devis", icon: FileText, tourId: "quotes" },
  { href: "/invoices", label: "Factures", icon: Receipt, tourId: undefined },
  { href: "/dossiers", label: "Dossiers", icon: FolderOpen, tourId: "dossiers" },
  { href: "/calendar", label: "Agenda", icon: Calendar, tourId: undefined },
  { href: "/inbox", label: "Inbox", icon: Inbox, tourId: "inbox" },
  { href: "/suppliers", label: "Fournisseurs", icon: Truck, tourId: undefined },
  { href: "/settings/wa", label: "WhatsApp", icon: MessageCircle, tourId: "settings" },
  { href: "/settings/email", label: "Paramètres email", icon: Mail, tourId: undefined },
  { href: "/settings/statuses", label: "Statuts", icon: Tag, tourId: undefined },
  { href: "/settings/services", label: "Catalogue services", icon: ShoppingBag, tourId: undefined },
  { href: "/scrape", label: "Scraping", icon: RefreshCw, tourId: undefined },
];

type NavItem = (typeof NAV_ITEMS)[number];

const STORAGE_KEY = "caro_sidebar_order";

// Inline vertical-axis modifier (avoids needing @dnd-kit/modifiers package)
const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

function loadOrder(defaults: NavItem[]): NavItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaults;
    const hrefs: string[] = JSON.parse(stored);
    const ordered = hrefs.flatMap((h) => defaults.filter((i) => i.href === h));
    const missing = defaults.filter((i) => !hrefs.includes(i.href));
    return [...ordered, ...missing];
  } catch {
    return defaults;
  }
}

function saveOrder(items: NavItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map((i) => i.href)));
}

// ─── SortableNavItem ──────────────────────────────────────────────────────────

interface SortableNavItemProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}

function SortableNavItem({ item, active, collapsed }: SortableNavItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.href });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const link = (
    <Link
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

  const inner = (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center"
      data-tour={item.tourId}
      {...attributes}
    >
      {/* Drag handle — only when expanded */}
      {!collapsed && (
        <div
          {...listeners}
          className="opacity-0 group-hover:opacity-100 flex items-center px-1 cursor-grab active:cursor-grabbing text-sidebar-foreground/30 shrink-0"
          aria-label="Réordonner"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="flex-1 min-w-0">{link}</div>
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip key={item.href}>
        <TooltipTrigger>
          <div
            ref={setNodeRef}
            style={style}
            data-tour={item.tourId}
            {...attributes}
          >
            {link}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return inner;
}

// ─── AdminSidebar ─────────────────────────────────────────────────────────────

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Initialise with defaults to avoid hydration mismatch; load from
  // localStorage after mount.
  const [orderedItems, setOrderedItems] = useState<NavItem[]>(() => NAV_ITEMS);

  useEffect(() => {
    setOrderedItems(loadOrder(NAV_ITEMS));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.href === active.id);
      const newIndex = prev.findIndex((i) => i.href === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      saveOrder(next);
      return next;
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const navContent = orderedItems.map((item) => {
    const active = pathname.startsWith(item.href);
    return (
      <SortableNavItem
        key={item.href}
        item={item}
        active={active}
        collapsed={collapsed}
      />
    );
  });

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
        {collapsed ? (
          // Collapsed: plain list, no DnD
          navContent
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={orderedItems.map((i) => i.href)}
              strategy={verticalListSortingStrategy}
            >
              {navContent}
            </SortableContext>
          </DndContext>
        )}
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
          onClick={() => (window as Window & { startTour?: () => void }).startTour?.()}
          className={cn(
            "w-full text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
          title="Visite guidée"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Aide</span>}
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
