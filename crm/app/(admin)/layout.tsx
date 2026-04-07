import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { GuidedTour } from "@/components/guided-tour";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/portal");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
              Administration
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <GuidedTour />
    </div>
  );
}
