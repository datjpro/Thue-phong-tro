"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export type ContractAgreementData = {
  contractNumber: string | null;
  startDate: string;
  endDate: string | null;
  rentPrice: number;
  deposit: number;
  billingCycle: number;
  terms: string | null;
  status: string;
  propertyName: string;
  propertyAddress: string | null;
  electricPrice?: number;
  waterPrice?: number;
  roomName: string;
  bedName?: string | null;
  primaryTenant: {
    fullName: string;
    phone: string | null;
    idNumber: string | null;
    birthDate: string | null;
    hometown: string | null;
    workplace: string | null;
  } | null;
};

export function ContractSheet({ data }: { data: ContractAgreementData }) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-1.5 border-border shadow-2xs"
        >
          <Printer size={15} />
          <span>In hợp đồng điện tử</span>
        </Button>
      </div>

      <article className="relative mx-auto w-full max-w-3xl rounded-[4px] border border-border bg-card p-6 sm:p-10 text-card-foreground shadow-sm print:border-none print:p-0 print:shadow-none print:text-black print:bg-white text-sm leading-relaxed">
        {/* Quốc hiệu & Tiêu ngữ */}
        <div className="text-center space-y-1 pb-4 border-b border-border/80">
          <p className="font-bold text-xs sm:text-sm uppercase tracking-wider">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="text-xs sm:text-sm font-semibold underline underline-offset-4">
            Độc lập – Tự do – Hạnh phúc
          </p>
          <p className="text-[11px] text-muted-foreground pt-2 italic">---o0o---</p>
        </div>

        {/* Tiêu đề hợp đồng */}
        <div className="my-6 text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground print:text-black">
            HỢP ĐỒNG THUÊ PHÒNG TRỌ
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            Mã số: {data.contractNumber || "HĐ-DTT-2026"}
          </p>
        </div>

        {/* Căn cứ pháp lý */}
        <p className="italic text-xs text-muted-foreground mb-4">
          - Căn cứ Bộ luật Dân sự số 91/2015/QH13 và các văn bản pháp luật hiện hành liên quan;
          <br />- Căn cứ nhu cầu và sự thỏa thuận tự nguyện của hai bên;
        </p>

        {/* Bên A: Bên Cho Thuê */}
        <div className="space-y-2 mb-4">
          <h2 className="font-bold text-sm uppercase text-primary border-b border-border/40 pb-1">
            BÊN CHO THUÊ (BÊN A)
          </h2>
          <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm pl-2">
            <p>
              <strong>Cơ sở kinh doanh / Nhà trọ:</strong> {data.propertyName}
            </p>
            <p>
              <strong>Địa chỉ khu trọ:</strong> {data.propertyAddress || "Theo đăng ký kinh doanh"}
            </p>
          </div>
        </div>

        {/* Bên B: Bên Thuê */}
        <div className="space-y-2 mb-4">
          <h2 className="font-bold text-sm uppercase text-primary border-b border-border/40 pb-1">
            BÊN THUÊ PHÒNG (BÊN B)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs sm:text-sm pl-2">
            <p>
              <strong>Họ và tên:</strong>{" "}
              {data.primaryTenant?.fullName ||
                "...................................................."}
            </p>
            <p>
              <strong>Số CCCD:</strong>{" "}
              {data.primaryTenant?.idNumber ||
                "...................................................."}
            </p>
            <p>
              <strong>Ngày sinh:</strong>{" "}
              {data.primaryTenant?.birthDate
                ? formatDate(data.primaryTenant.birthDate)
                : "...................................................."}
            </p>
            <p>
              <strong>Điện thoại:</strong>{" "}
              {data.primaryTenant?.phone || "...................................................."}
            </p>
            <p className="sm:col-span-2">
              <strong>Nơi ĐK thường trú:</strong>{" "}
              {data.primaryTenant?.hometown ||
                "...................................................................................................."}
            </p>
            <p className="sm:col-span-2">
              <strong>Nơi làm việc / Học tập:</strong>{" "}
              {data.primaryTenant?.workplace ||
                "...................................................................................................."}
            </p>
          </div>
        </div>

        {/* Các điều khoản */}
        <div className="space-y-3 mb-6">
          <h2 className="font-bold text-sm uppercase text-primary border-b border-border/40 pb-1">
            NỘI DUNG VÀ ĐIỀU KHOẢN HỢP ĐỒNG
          </h2>

          <div className="space-y-2 text-xs sm:text-sm pl-2">
            <p>
              <strong>Điều 1. Đối tượng thuê:</strong> Bên A đồng ý cho Bên B thuê phòng{" "}
              <strong>{data.roomName}</strong>
              {data.bedName ? ` (${data.bedName})` : ""} tại địa chỉ nêu trên.
            </p>

            <p>
              <strong>Điều 2. Thời hạn thuê:</strong> Từ ngày{" "}
              <strong>{formatDate(data.startDate)}</strong>
              {data.endDate
                ? ` đến ngày ${formatDate(data.endDate)}`
                : " (Hợp đồng không thời hạn đến khi 2 bên thanh lý)"}
              .
            </p>

            <p>
              <strong>Điều 3. Giá thuê và Phương thức thanh toán:</strong>
              <br />- Giá thuê phòng: <strong>{formatMoney(data.rentPrice)}</strong> / tháng.
              <br />- Chu kỳ đóng tiền: <strong>{data.billingCycle} tháng / lần</strong> (vào ngày
              01–05 đầu mỗi kỳ).
              <br />- Tiền đặt cọc bảo đảm: <strong>{formatMoney(data.deposit)}</strong> (hoàn trả
              khi thanh lý hợp đồng và bàn giao hiện trạng phòng nguyên vẹn).
            </p>

            <p>
              <strong>Điều 4. Giá dịch vụ điện, nước & Phí khác:</strong>
              <br />- Tiền điện:{" "}
              {data.electricPrice
                ? `${formatMoney(data.electricPrice)} / kWh`
                : "Theo biểu giá nhà trọ"}
              .
              <br />- Tiền nước:{" "}
              {data.waterPrice
                ? `${formatMoney(data.waterPrice)} / m³ hoặc theo đầu người`
                : "Theo biểu giá nhà trọ"}
              .
              <br />- Các loại phí dịch vụ (rác, wifi, gửi xe...) được kê chi tiết trên phiếu thu
              hàng tháng.
            </p>

            <p>
              <strong>Điều 5. Quyền và nghĩa vụ hai bên:</strong>
              <br />- Bên B có trách nhiệm bảo quản trang thiết bị, tài sản trong phòng, giữ gìn vệ
              sinh chung, đăng ký tạm trú đúng quy định pháp luật và không tổ chức hoạt động trái
              pháp luật.
              <br />- Trường hợp chấm dứt hợp đồng trước hạn, Bên B phải thông báo trước ít nhất
              15–30 ngày.
            </p>

            {data.terms ? (
              <p>
                <strong>Điều 6. Thỏa thuận bổ sung:</strong>
                <br />
                {data.terms}
              </p>
            ) : null}
          </div>
        </div>

        {/* Chữ ký 2 bên */}
        <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs sm:text-sm">
          <div className="space-y-16">
            <div>
              <p className="font-bold uppercase">ĐẠI DIỆN BÊN A</p>
              <p className="text-xs text-muted-foreground italic">(Ký, ghi rõ họ tên)</p>
            </div>
            <p className="font-semibold">{data.propertyName}</p>
          </div>

          <div className="space-y-16">
            <div>
              <p className="font-bold uppercase">ĐẠI DIỆN BÊN B</p>
              <p className="text-xs text-muted-foreground italic">(Ký, ghi rõ họ tên)</p>
            </div>
            <p className="font-semibold">{data.primaryTenant?.fullName || "Bên thuê phòng"}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
