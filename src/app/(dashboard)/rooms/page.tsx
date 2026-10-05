import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { RoomList } from "@/features/rooms/components/room-list";
import { listRooms } from "@/features/rooms/queries";
import { currentPeriod, todayVn } from "@/lib/dates";
import { requireContext } from "@/lib/session";

export default async function RoomsPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations("rooms");
  const rows = await listRooms(propertyId, currentPeriod());

  // Giao diện 1 phòng chỉ là cách hiển thị: nhảy thẳng tới chi tiết, không đổi logic.
  if (rows.length === 1) redirect(`/rooms/${rows[0].id}`);

  return (
    <>
      <PageHeader
        title={t("title")}
        action={
          <Link href="/rooms/new" className={buttonVariants()}>
            <Plus size={20} aria-hidden="true" />
            {t("add")}
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDesc")} />
      ) : (
        <RoomList rows={rows} today={todayVn()} />
      )}
    </>
  );
}
