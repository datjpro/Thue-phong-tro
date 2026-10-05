import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { MaintenanceForm } from "@/features/maintenance/components/maintenance-form";
import { MaintenanceStatusSelect } from "@/features/maintenance/components/maintenance-status-select";
import { listMaintenance } from "@/features/maintenance/queries";
import { listRooms } from "@/features/rooms/queries";
import { currentPeriod, formatDate } from "@/lib/dates";
import { requireContext } from "@/lib/session";

export default async function MaintenancePage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations("maintenance");
  const [rows, rooms] = await Promise.all([
    listMaintenance(propertyId),
    listRooms(propertyId, currentPeriod()),
  ]);

  return (
    <>
      <PageHeader
        title={t("title")}
        action={
          <MaintenanceForm
            propertyId={propertyId}
            rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
          />
        }
      />
      {rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDesc")} />
      ) : (
        <ul className="flex flex-col divide-y divide-suong rounded-panel border border-suong bg-mat">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-muc-phu">
                  {r.roomName} · {formatDate(r.createdAt)}
                </p>
                {r.description ? <p className="mt-1 text-sm">{r.description}</p> : null}
              </div>
              <StatusBadge kind={r.status} />
              <MaintenanceStatusSelect propertyId={propertyId} id={r.id} status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
