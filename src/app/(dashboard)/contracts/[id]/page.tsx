import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContractSheet } from "@/components/shared/contract-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { getContractDetail } from "@/features/contracts/queries";
import { requireContext } from "@/lib/session";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireContext();
  const detail = await getContractDetail(ctx.propertyId, id);
  if (!detail) notFound();

  const primary = detail.tenants.find((t) => t.isPrimary === "yes") ?? detail.tenants[0] ?? null;

  return (
    <PageTransition className="space-y-6">
      <div className="no-print">
        <Link
          href="/contracts"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Danh sách hợp đồng</span>
        </Link>
      </div>

      <div className="no-print">
        <PageHeader
          title={`Hợp đồng ${detail.contract.contractNumber || detail.room?.name}`}
          description={`Phòng ${detail.room?.name}${detail.bed ? ` (${detail.bed.name})` : ""} · Người thuê: ${primary?.fullName || "Chưa gán"}`}
        />
      </div>

      <ContractSheet
        data={{
          contractNumber: detail.contract.contractNumber,
          startDate: detail.contract.startDate,
          endDate: detail.contract.endDate,
          rentPrice: detail.contract.rentPrice,
          deposit: detail.contract.deposit,
          billingCycle: detail.contract.billingCycle,
          terms: detail.contract.terms,
          status: detail.contract.status,
          propertyName: detail.property?.name || "Nhà trọ",
          propertyAddress: detail.property?.address || null,
          electricPrice: detail.property?.electricPrice,
          waterPrice: detail.property?.waterPrice,
          roomName: detail.room?.name || "",
          bedName: detail.bed?.name || null,
          primaryTenant: primary
            ? {
                fullName: primary.fullName,
                phone: primary.phone,
                idNumber: primary.idNumber,
                birthDate: primary.birthDate,
                hometown: primary.hometown,
                workplace: primary.workplace,
              }
            : null,
        }}
      />
    </PageTransition>
  );
}
