import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TenantForm } from "@/features/tenants/components/tenant-form";
import { listTenants } from "@/features/tenants/queries";
import { requireContext } from "@/lib/session";

export default async function TenantsPage() {
  const { propertyId } = await requireContext();
  const t = await getTranslations("tenants");
  const rows = await listTenants(propertyId);

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {rows.length === 0 ? (
          <EmptyState title={t("emptyTitle")} description={t("emptyDesc")} />
        ) : (
          <ul className="flex flex-col divide-y divide-suong self-start rounded-panel border border-suong bg-mat">
            {rows.map((r) => (
              <li key={r.id} className="flex min-h-14 flex-col justify-center px-4 py-2">
                <span className="font-semibold">{r.fullName}</span>
                <span className="text-sm text-muc-phu">
                  {[r.phone, r.idNumber].filter(Boolean).join(" · ") || "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="self-start">
          <TenantForm propertyId={propertyId} />
        </div>
      </div>
    </>
  );
}
