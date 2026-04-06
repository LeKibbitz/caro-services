import { ScrapeLauncher } from "./scrape-launcher";

export default function ScrapePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scraping</h1>
        <p className="text-muted-foreground mt-1">
          Lancer et suivre les scrapes Salonkee et lesfrontaliers.lu
        </p>
      </div>

      <ScrapeLauncher />
    </div>
  );
}
