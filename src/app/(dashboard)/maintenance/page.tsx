import { MessageSquareText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { MaintenanceForm } from "@/features/maintenance/components/maintenance-form";
import { MaintenanceListView } from "@/features/maintenance/components/maintenance-list-view";
import { listMaintenance } from "@/features/maintenance/queries";
import { listRooms } from "@/features/rooms/queries";
import { currentPeriod } from "@/lib/dates";
import { requireContext } from "@/lib/session";

export default async function MaintenancePage() {
  const ctx = await requireContext();
  const isTenant = ctx.role === "tenant";

  const [allRows, allRooms] = await Promise.all([
    listMaintenance(ctx.propertyId),
    listRooms(ctx.propertyId, currentPeriod()),
  ]);

  const rows = isTenant ? allRows.filter((r) => r.roomId === ctx.roomId) : allRows;
  const availableRooms = isTenant
    ? ctx.roomId && ctx.roomName
      ? [{ id: ctx.roomId, name: ctx.roomName }]
      : []
    : allRooms.map((r) => ({ id: r.id, name: r.name }));

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title={isTenant ? "Phản ánh & Báo sửa chữa" : "Phản ánh & Báo sửa chữa"}
        description={
          isTenant
            ? "Gửi phản ánh về tiếng ồn, an ninh, vệ sinh hoặc yêu cầu sửa chữa thiết bị trong phòng"
            : `Quản lý ${rows.length} phản ánh và yêu cầu sửa chữa từ người thuê`
        }
        action={
          availableRooms.length > 0 ? (
            <MaintenanceForm propertyId={ctx.propertyId} rooms={availableRooms} />
          ) : null
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có phản ánh hay báo sửa chữa nào"
          description={
            isTenant
              ? "Bạn có thể gửi phản ánh về tiếng ồn, an ninh hoặc báo hỏng thiết bị bất cứ lúc nào."
              : "Hiện tại nhà trọ chưa có phản ánh hay yêu cầu sửa chữa nào."
          }
          icon={MessageSquareText}
        />
      ) : (
        <MaintenanceListView propertyId={ctx.propertyId} items={rows} isTenant={isTenant} />
      )}
    </PageTransition>
  );
}
