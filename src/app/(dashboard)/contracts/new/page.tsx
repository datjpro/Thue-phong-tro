import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { buttonVariants } from "@/components/ui/button";
import { ContractForm } from "@/features/contracts/components/contract-form";
import { getContractFormOptions } from "@/features/contracts/queries";
import { todayVn } from "@/lib/dates";
import { requireContext } from "@/lib/session";

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ roomId?: string }>;
}) {
  const ctx = await requireContext();
  if (ctx.role === "tenant") redirect("/");

  const { roomId } = await searchParams;
  const { propertyId } = ctx;
  const t = await getTranslations("contracts");
  const options = await getContractFormOptions(propertyId);

  return (
    <PageTransition className="space-y-6">
      <div>
        <Link
          href="/contracts"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Danh sách hợp đồng</span>
        </Link>
      </div>

      <PageHeader title={t("create")} description="Điền thông tin và chỉ số điện nước ban đầu" />

      {options.rooms.length === 0 ? (
        <EmptyState title={t("noFreeRoomTitle")} description={t("noFreeRoomDesc")} />
      ) : options.tenants.length === 0 ? (
        <EmptyState
          title={t("noTenantTitle")}
          description={t("noTenantDesc")}
          action={
            <Link href="/tenants" className={buttonVariants({ variant: "primary" })}>
              {t("addTenant")}
            </Link>
          }
        />
      ) : (
        <ContractForm
          propertyId={propertyId}
          today={todayVn()}
          rooms={options.rooms}
          tenants={options.tenants}
          beds={options.beds}
          defaultRoomId={roomId}
        />
      )}
    </PageTransition>
  );
}
