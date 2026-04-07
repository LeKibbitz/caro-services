// Pure types and helpers — no DB/Node.js imports, safe for client components

export interface ServiceItem {
  id: string;
  category: string;
  description: string;
  unitPrice: number;
  badge?: string;
  detail?: string;
}

export function groupByCategory(items: ServiceItem[]): { category: string; items: ServiceItem[] }[] {
  const map = new Map<string, ServiceItem[]>();
  for (const item of items) {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category)!.push(item);
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
}
