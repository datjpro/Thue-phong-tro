import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { buttonVariants } from "@/components/ui/button";
import { RoomList } from "@/features/rooms/components/room-list";
import { listRooms } from "@/features/rooms/queries";
import { currentPeriod, todayVn } from "@/lib/dates";
import { requireContext } from "@/lib/session";

export default async function RoomsPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations("rooms");
  const rows = await listRooms(propertyId, currentPeriod());

  // Giao diện 1 phòng: chuyển thẳng tới chi tiết (AGENTS.md & UX-UI 5.2)
  if (rows.length === 1) redirect(`/rooms/${rows[0].id}`);

  return (
    <PageTransition>
      <PageHeader
        title={t("title")}
        description={`${rows.length} phòng đang quản lý`}
        action={
          <Link href="/rooms/new" className={buttonVariants({ variant: "primary" })}>
            <Plus size={18} aria-hidden="true" />
            <span>{t("add")}</span>
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          action={
            <Link href="/rooms/new" className={buttonVariants({ variant: "primary" })}>
              <Plus size={18} aria-hidden="true" />
              <span>{t("add")}</span>
            </Link>
          }
        />
      ) : (
        <RoomList rows={rows} today={todayVn()} />
      )}
    </PageTransition>
  );
}
