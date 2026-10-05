import { BottomNav, Sidebar } from "@/components/shared/app-nav";
import { requireContext } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireContext();
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-8">
        <div className="max-w-[1200px]">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
