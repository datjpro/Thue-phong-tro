import { Building2, CreditCard, Phone, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { TenantForm } from "@/features/tenants/components/tenant-form";
import { TenantRowAccountButton } from "@/features/tenants/components/tenant-row-account-button";
import { listTenants } from "@/features/tenants/queries";
import { requireContext } from "@/lib/session";

export default async function TenantsPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations("tenants");
  const rows = await listTenants(propertyId);

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title={t("title")}
        description={`${rows.length} người thuê đã lưu trong hệ thống`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Tenant list */}
        <div>
          {rows.length === 0 ? (
            <EmptyState title={t("emptyTitle")} description={t("emptyDesc")} icon={User} />
          ) : (
            <div className="flex flex-col gap-3">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-suong bg-mat p-4 shadow-xs transition-all hover:border-la/40"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-la/10 text-la font-bold text-sm">
                      {r.fullName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-muc text-sm sm:text-base truncate">
                          {r.fullName}
                        </p>
                        {r.roomName ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-giay px-2 py-0.5 text-[11px] font-medium text-muc-phu border border-suong/60 shrink-0">
                            <Building2 size={11} className="text-la" aria-hidden="true" />
                            {r.roomName}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muc-phu">
                        {r.phone ? (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone size={12} className="text-muc-phu/70" />
                            {r.phone}
                          </span>
                        ) : null}
                        {r.idNumber ? (
                          <span className="flex items-center gap-1 font-mono">
                            <CreditCard size={12} className="text-muc-phu/70" />
                            CCCD: {r.idNumber}
                          </span>
                        ) : null}
                        {!r.phone && !r.idNumber ? <span>Chưa có liên hệ</span> : null}
                      </div>
                    </div>
                  </div>

                  {/* Cột cấp tài khoản / thông tin tài khoản người thuê */}
                  <div className="shrink-0">
                    <TenantRowAccountButton propertyId={propertyId} tenant={r} />
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
