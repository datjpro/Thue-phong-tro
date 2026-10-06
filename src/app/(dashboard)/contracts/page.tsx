import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { buttonVariants } from "@/components/ui/button";
import { ContractsManager } from "@/features/contracts/components/contracts-manager";
import { listContracts } from "@/features/contracts/queries";
import { todayVn } from "@/lib/dates";
import { requireContext } from "@/lib/session";

export default async function ContractsPage() {
  const ctx = await requireContext();
  if (ctx.role === "tenant") redirect("/");

  const { propertyId } = ctx;
  const t = await getTranslations("contracts");
  const rows = await listContracts(propertyId);
  const today = todayVn();

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title={t("title")}
        description={`${rows.length} hợp đồng thuê · Quản lý vòng đời, gia hạn & lịch sử`}
        action={
          <Link href="/contracts/new" className={buttonVariants({ variant: "primary" })}>
            <Plus size={18} aria-hidden="true" />
            <span>{t("create")}</span>
          </Link>
        }
      />

      <ContractsManager propertyId={propertyId} contracts={rows} today={today} />
    </PageTransition>
  );
}
