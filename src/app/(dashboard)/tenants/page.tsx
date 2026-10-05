import { CreditCard, Phone, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { TenantForm } from "@/features/tenants/components/tenant-form";
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
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:bg-card/90"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      {r.fullName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-sm sm:text-base truncate">
                        {r.fullName}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {r.phone ? (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone size={12} className="text-muted-foreground/70" />
                            {r.phone}
                          </span>
                        ) : null}
                        {r.idNumber ? (
                          <span className="flex items-center gap-1 font-mono">
                            <CreditCard size={12} className="text-muted-foreground/70" />
                            {r.idNumber}
                          </span>
                        ) : null}
                        {!r.phone && !r.idNumber ? <span>Chưa có liên hệ</span> : null}
                      </div>
                    </div>
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
