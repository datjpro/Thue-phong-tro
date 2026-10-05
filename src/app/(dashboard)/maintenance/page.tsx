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
  const ctx = await requireContext();
  const t = await getTranslations("maintenance");
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
        title={isTenant ? "Báo hỏng & Sửa chữa" : t("title")}
        description={
          isTenant
            ? `${rows.length} yêu cầu sửa chữa của phòng bạn`
            : `${rows.length} yêu cầu sửa chữa đã ghi nhận`
        }
        action={
          availableRooms.length > 0 ? (
            <MaintenanceForm propertyId={ctx.propertyId} rooms={availableRooms} />
          ) : null
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={isTenant ? "Phòng bạn chưa có yêu cầu sửa chữa nào." : t("emptyDesc")}
          icon={Wrench}
        />
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

              {!isTenant ? (
                <div className="flex items-center justify-between border-t border-border/40 pt-3 sm:border-0 sm:pt-0 sm:justify-end gap-3 shrink-0">
                  <MaintenanceStatusSelect
                    propertyId={ctx.propertyId}
                    id={r.id}
                    status={r.status}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
