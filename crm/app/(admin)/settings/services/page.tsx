import { getCatalog, groupByCategory } from "@/lib/services";
import { ServiceCatalogEditor } from "./service-catalog-editor";

export default async function ServicesCatalogPage() {
  const catalog = await getCatalog();
  const grouped = groupByCategory(catalog);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catalogue de services</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Services proposés par Caroline Finance — utilisés dans les devis.
        </p>
      </div>
      <ServiceCatalogEditor catalog={catalog} grouped={grouped} />
    </div>
  );
}
