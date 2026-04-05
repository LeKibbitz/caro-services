"use client";

import { useState, useMemo, useCallback, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, CheckSquare, Square, MinusSquare } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StatusOption = { value: string; label: string };

export type Column<T> = {
  key: string;
  label: string;
  className?: string;
  render: (item: T) => ReactNode;
};

type Props<T> = {
  items: T[];
  /** Fields to search on each item (dot notation NOT supported — top-level only) */
  searchFields: (keyof T)[];
  /** Nested search: pass a function that returns extra searchable strings */
  searchExtract?: (item: T) => string;
  /** Column definitions for the table */
  columns: Column<T>[];
  /** Unique ID extractor */
  getId: (item: T) => string;
  /** Status filter options */
  statusOptions?: StatusOption[];
  /** Field to use for status filtering */
  statusField?: keyof T;
  /** Custom status matcher (for grouped statuses like contacted = contacted+replied+qualified) */
  statusMatcher?: (item: T, status: string) => boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Bulk actions — receives selected IDs */
  bulkActions?: (selectedIds: string[]) => ReactNode;
  /** Layout mode */
  layout?: "table" | "cards" | "rows";
  /** Card renderer (for cards/rows layout) */
  renderCard?: (item: T, selected: boolean, onToggle: () => void) => ReactNode;
  /** Cards grid className */
  cardsClassName?: string;
  /** Optional class on the wrapper */
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FilterableList<T>({
  items,
  searchFields,
  searchExtract,
  columns,
  getId,
  statusOptions,
  statusField,
  statusMatcher,
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat.",
  bulkActions,
  layout = "table",
  renderCard,
  cardsClassName,
  className,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ---- Filtering ----
  const filtered = useMemo(() => {
    let result = items;

    // Status filter
    if (activeStatus) {
      if (statusMatcher) {
        result = result.filter((item) => statusMatcher(item, activeStatus));
      } else if (statusField) {
        result = result.filter(
          (item) => String(item[statusField]) === activeStatus
        );
      }
    }

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((item) => {
        for (const field of searchFields) {
          const val = item[field];
          if (val && String(val).toLowerCase().includes(q)) return true;
        }
        if (searchExtract) {
          return searchExtract(item).toLowerCase().includes(q);
        }
        return false;
      });
    }

    return result;
  }, [items, query, activeStatus, searchFields, searchExtract, statusField, statusMatcher]);

  // ---- Selection ----
  const filteredIds = useMemo(
    () => new Set(filtered.map(getId)),
    [filtered, getId]
  );
  const selectedInView = useMemo(
    () => new Set([...selected].filter((id) => filteredIds.has(id))),
    [selected, filteredIds]
  );
  const allSelected = filteredIds.size > 0 && selectedInView.size === filteredIds.size;
  const someSelected = selectedInView.size > 0 && !allSelected;

  const toggleOne = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    []
  );

  const toggleAll = useCallback(() => {
    if (allSelected) {
      // Deselect all in view
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of filteredIds) next.delete(id);
        return next;
      });
    } else {
      // Select all in view
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of filteredIds) next.add(id);
        return next;
      });
    }
  }, [allSelected, filteredIds]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  function handleStatusClick(value: string) {
    setActiveStatus((prev) => (prev === value ? null : value));
    setSelected(new Set());
  }

  function handleClear() {
    setQuery("");
    setActiveStatus(null);
    setSelected(new Set());
  }

  const hasFilters = query.trim() !== "" || activeStatus !== null;

  // ---- Render ----
  return (
    <div className={cn("space-y-3", className)}>
      {/* Search + Status bar */}
      <div className="filterable-bar flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="filterable-input h-10 pl-9 w-64"
          />
        </div>

        {statusOptions && statusOptions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusOptions.map((opt) => {
              const isActive = activeStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleStatusClick(opt.value)}
                  className={cn(
                    "filterable-status-btn inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border bg-background text-foreground hover:bg-muted hover:border-primary/30"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            <X className="h-3.5 w-3.5" />
            Effacer
          </button>
        )}

        {hasFilters && (
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedInView.size > 0 && bulkActions && (
        <div className="filterable-bulk-bar flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">
            {selectedInView.size} sélectionné{selectedInView.size !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">{bulkActions([...selectedInView])}</div>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Désélectionner
          </button>
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : layout === "table" ? (
        <Card className="filterable-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 w-10">
                      <button
                        type="button"
                        onClick={toggleAll}
                        className="filterable-checkbox text-muted-foreground hover:text-foreground transition-colors"
                        title={allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                      >
                        {allSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : someSelected ? (
                          <MinusSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={cn("px-4 py-3 font-medium", col.className)}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const id = getId(item);
                    const isSelected = selected.has(id);
                    return (
                      <tr
                        key={id}
                        className={cn(
                          "border-b last:border-0 transition-colors",
                          isSelected
                            ? "bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <td className="px-4 py-3 w-10">
                          <button
                            type="button"
                            onClick={() => toggleOne(id)}
                            className="filterable-checkbox text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={cn("px-4 py-3", col.className)}
                          >
                            {col.render(item)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Cards / Rows layout */
        <div className={cardsClassName ?? "grid grid-cols-1 gap-3"}>
          {filtered.map((item) => {
            const id = getId(item);
            const isSelected = selected.has(id);
            return renderCard ? (
              <div key={id}>{renderCard(item, isSelected, () => toggleOne(id))}</div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
