import { Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
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
    <PageTransition className="space-y-6">
      <PageHeader
        title={t("title")}
        description={`${rows.length} yêu cầu sửa chữa đã ghi nhận`}
        action={
          <MaintenanceForm
            propertyId={propertyId}
            rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
          />
        }
      />
      {rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDesc")} icon={Wrench} />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-primary/40 hover:bg-card/90 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-base sm:text-lg text-foreground">{r.title}</span>
                  <StatusBadge kind={r.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground font-mono">
                  {r.roomName} · Ngày báo: {formatDate(r.createdAt)}
                </p>
                {r.description ? (
                  <p className="mt-2 text-sm text-foreground/90 bg-muted/30 p-2.5 rounded-lg border border-border/40">
                    {r.description}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-3 sm:border-0 sm:pt-0 sm:justify-end gap-3 shrink-0">
                <MaintenanceStatusSelect propertyId={propertyId} id={r.id} status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
