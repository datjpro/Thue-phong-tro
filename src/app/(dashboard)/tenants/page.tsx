import {
  Building2,
  Car,
  CreditCard,
  GraduationCap,
  Layers,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { ExportResidenceButton } from "@/features/tenants/components/export-residence-button";
import { TenantForm } from "@/features/tenants/components/tenant-form";
import { TenantRowAccountButton } from "@/features/tenants/components/tenant-row-account-button";
import { listTenants } from "@/features/tenants/queries";
import { requireContext } from "@/lib/session";

export default async function TenantsPage() {
  const ctx = await requireContext();
  if (ctx.role === "tenant") redirect("/");

  const { propertyId } = ctx;
  const t = await getTranslations("tenants");
  const rows = await listTenants(propertyId);

  // Gom nhóm danh sách khách thuê theo tầng
  const floorGroups = rows.reduce<Record<string, typeof rows>>((acc, item) => {
    const key =
      item.floor !== null && item.floor !== undefined
        ? `Tầng ${item.floor}`
        : item.roomName
          ? `Phòng ${item.roomName}`
          : "Chưa gán phòng";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title={t("title")}
        description={`${rows.length} khách thuê trong hệ thống · Sắp xếp gọn gàng theo từng tầng`}
        action={<ExportResidenceButton tenants={rows} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Tenant list by floors */}
        <div>
          {rows.length === 0 ? (
            <EmptyState title={t("emptyTitle")} description={t("emptyDesc")} icon={User} />
          ) : (
            <div className="space-y-6">
              {Object.entries(floorGroups).map(([groupTitle, groupTenants]) => (
                <div key={groupTitle} className="space-y-3">
                  {/* Floor Header */}
                  <div className="flex items-center gap-2 border-b border-border/50 pb-1.5">
                    <Layers size={16} className="text-primary" />
                    <h3 className="font-bold text-sm text-foreground tracking-tight">
                      {groupTitle}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({groupTenants.length} người)
                    </span>
                  </div>

                  {/* Tenant cards for this floor */}
                  <div className="flex flex-col gap-3">
                    {groupTenants.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-2xs transition-all hover:border-primary/40 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                            {r.fullName.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-foreground text-sm sm:text-base truncate">
                                {r.fullName}
                              </p>
                              {r.roomName ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground border border-border/60 shrink-0">
                                  <Building2
                                    size={11}
                                    className="text-primary"
                                    aria-hidden="true"
                                  />
                                  {r.roomName}
                                </span>
                              ) : (
                                <span className="rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-medium">
                                  Chưa phân phòng
                                </span>
                              )}
                              {r.gender ? (
                                <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                  {r.gender === "male"
                                    ? "Nam"
                                    : r.gender === "female"
                                      ? "Nữ"
                                      : "Khác"}
                                </span>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              {r.phone ? (
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone size={12} className="text-muted-foreground/70" />
                                  <a
                                    href={`tel:${r.phone}`}
                                    className="hover:underline text-foreground"
                                  >
                                    {r.phone}
                                  </a>
                                </span>
                              ) : null}
                              {r.idNumber ? (
                                <span className="flex items-center gap-1 font-mono">
                                  <CreditCard size={12} className="text-muted-foreground/70" />
                                  CCCD: {r.idNumber}
                                </span>
                              ) : null}
                              {r.licensePlate ? (
                                <span className="flex items-center gap-1 font-mono">
                                  <Car size={12} className="text-muted-foreground/70" />
                                  {r.licensePlate}
                                </span>
                              ) : null}
                            </div>

                            {/* Quê quán / Nơi làm việc */}
                            {r.hometown || r.workplace ? (
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/90 pt-0.5">
                                {r.hometown ? (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={11} className="text-primary/70 shrink-0" />
                                    <span className="truncate max-w-[220px]">{r.hometown}</span>
                                  </span>
                                ) : null}
                                {r.workplace ? (
                                  <span className="flex items-center gap-1">
                                    <GraduationCap size={11} className="text-primary/70 shrink-0" />
                                    <span className="truncate max-w-[220px]">{r.workplace}</span>
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Cột cấp tài khoản / thông tin tài khoản người thuê */}
                        <div className="shrink-0 border-t border-border/30 pt-2 sm:border-0 sm:pt-0">
                          <TenantRowAccountButton propertyId={propertyId} tenant={r} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tenant form (sticky on desktop) */}
        <div className="lg:sticky lg:top-8 self-start">
          <TenantForm propertyId={propertyId} />
        </div>
      </div>
    </PageTransition>
  );
}
