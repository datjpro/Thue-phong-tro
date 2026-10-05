import { Plus } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { RoomList } from "@/features/rooms/components/room-list";
import { listRooms } from "@/features/rooms/queries";
import { currentPeriod, formatPeriodShort, todayVn } from "@/lib/dates";
import { invoiceDisplayStatus } from "@/lib/invoice-status";
import { formatMoney } from "@/lib/money";
import { requireContext } from "@/lib/session";

export default async function OverviewPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations();
  const period = currentPeriod();
  const today = todayVn();
  const rows = await listRooms(propertyId, period);

  const occupied = rows.filter((r) => r.hasActiveContract);
  const needReadings = occupied.filter((r) => !r.invoice).length;
  const unpaid = occupied.filter((r) => r.invoice && r.invoice.status !== "paid");
  const overdue = unpaid.filter(
    (r) =>
      r.invoice && invoiceDisplayStatus(r.invoice.status, r.invoice.dueDate, today) === "overdue",
  ).length;
  const toCollect = unpaid.reduce(
    (s, r) => s + (r.invoice ? r.invoice.total - r.invoice.paidAmount : 0),
    0,
  );
  const vacant = rows.filter((r) => !r.hasActiveContract).length;

  return (
    <>
      <PageHeader
        title={t("overview.title", { period: formatPeriodShort(period) })}
        description={t("overview.subtitle")}
      />

      {rows.length === 0 ? (
        <EmptyState
          title={t("overview.emptyTitle")}
          description={t("overview.emptyDesc")}
          action={
            <Link href="/rooms/new" className={buttonVariants()}>
              <Plus size={20} aria-hidden="true" />
              {t("rooms.add")}
            </Link>
          }
        />
      ) : (
        <>
          <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label={t("overview.needReadings")}
              value={String(needReadings)}
              tone={needReadings > 0 ? "warn" : undefined}
            />
            <Stat
              label={t("overview.unpaid")}
              value={String(unpaid.length)}
              tone={unpaid.length > 0 ? "warn" : undefined}
            />
            <Stat
              label={t("overview.overdue")}
              value={String(overdue)}
              tone={overdue > 0 ? "danger" : undefined}
            />
            <Stat label={t("overview.toCollect")} value={formatMoney(toCollect)} />
          </dl>
          {vacant > 0 ? (
            <p className="mb-3 text-sm text-muc-phu">{t("overview.vacant", { count: vacant })}</p>
          ) : null}
          <RoomList rows={rows} today={today} />
        </>
      )}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" | "danger" }) {
  return (
    <div className="rounded-panel border border-suong bg-mat p-4">
      <dt className="text-sm text-muc-phu">{label}</dt>
      <dd
        className={
          tone === "danger"
            ? "text-2xl font-bold text-danger"
            : tone === "warn"
              ? "text-2xl font-bold text-warning"
              : "text-2xl font-bold"
        }
      >
        {value}
      </dd>
    </div>
  );
}
