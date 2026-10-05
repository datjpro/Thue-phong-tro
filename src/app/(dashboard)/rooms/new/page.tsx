import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { RoomForm } from "@/features/rooms/components/room-form";
import { requireContext } from "@/lib/session";

export default async function NewRoomPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations("rooms");
  return (
    <>
      <PageHeader title={t("add")} description={t("addHint")} />
      <RoomForm propertyId={propertyId} />
    </>
  );
}
