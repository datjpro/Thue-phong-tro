import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { RoomForm } from "@/features/rooms/components/room-form";
import { listRoomNames } from "@/features/rooms/queries";
import { requireContext } from "@/lib/session";

export default async function NewRoomPage() {
  const ctx = await requireContext();
  if (ctx.role === "tenant") redirect("/");

  const { propertyId } = ctx;
  const t = await getTranslations("rooms");
  const existingRooms = await listRoomNames(propertyId);

  return (
    <PageTransition className="space-y-6">
      <div>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Danh sách phòng</span>
        </Link>
      </div>

      <PageHeader title={t("add")} description={t("addHint")} />
      <RoomForm propertyId={propertyId} existingRooms={existingRooms} />
    </PageTransition>
  );
}
