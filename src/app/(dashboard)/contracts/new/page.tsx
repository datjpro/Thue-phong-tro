import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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
  const { roomId } = await searchParams;
  const { propertyId } = await requireContext();
  const t = await getTranslations("contracts");
  const options = await getContractFormOptions(propertyId);

  return (
    <>
      <PageHeader title={t("create")} />
      {options.rooms.length === 0 ? (
        <EmptyState title={t("noFreeRoomTitle")} description={t("noFreeRoomDesc")} />
      ) : options.tenants.length === 0 ? (
        <EmptyState
          title={t("noTenantTitle")}
          description={t("noTenantDesc")}
          action={
            <Link href="/tenants" className={buttonVariants()}>
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
          defaultRoomId={roomId}
        />
      )}
    </>
  );
}
