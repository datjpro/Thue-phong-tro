import { BottomNav, DesktopBottomBar, MobileTopBar, Sidebar } from "@/components/shared/app-nav";
import { requireContext } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireContext();
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <MobileTopBar />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pb-24 lg:px-8 lg:pb-12 lg:pt-8">
          <div className="mx-auto max-w-[1200px] w-full">{children}</div>
        </main>
      </div>
      <BottomNav />
      <DesktopBottomBar />
    </div>
  );
}
