"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  waterPricingType?: "meter" | "per_person";
  waterPricePerPerson?: number;
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
  owner?: {
    name: string | null;
    birthDate: string | null;
    idNumber: string | null;
    idDate: string | null;
    idPlace: string | null;
    hometown: string | null;
    phone: string | null;
  } | null;
};

function parseDateParts(dateStr?: string | null) {
  if (!dateStr) return { day: "……", month: "……", year: "20……" };
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return { day: parts[2], month: parts[1], year: parts[0] };
  }
  return { day: "……", month: "……", year: "20……" };
}

export function ContractSheet({ data }: { data: ContractAgreementData }) {
  function handlePrint() {
    window.print();
  }

  const start = parseDateParts(data.startDate);
  const end = parseDateParts(data.endDate);
  const tenantBirth = parseDateParts(data.primaryTenant?.birthDate);
  const ownerBirth = parseDateParts(data.owner?.birthDate);
  const ownerIdDate = parseDateParts(data.owner?.idDate);

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
          <span>In hợp đồng</span>
        </Button>
      </div>

      <article className="relative mx-auto w-full max-w-3xl rounded-[4px] border border-border bg-card p-6 sm:p-10 text-card-foreground shadow-sm print:border-none print:p-0 print:shadow-none print:text-black print:bg-white text-sm leading-relaxed font-serif">
        {/* Quốc hiệu & Tiêu ngữ */}
        <div className="text-center space-y-1 pb-4">
          <p className="font-bold text-sm sm:text-base uppercase tracking-wider text-foreground print:text-black">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="text-xs sm:text-sm font-semibold underline underline-offset-4 text-foreground print:text-black">
            Độc lập – Tự do – Hạnh phúc
          </p>
        </div>

        {/* Tiêu đề hợp đồng */}
        <div className="my-5 text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground print:text-black">
            HỢP ĐỒNG THUÊ PHÒNG TRỌ
          </h1>
          {data.contractNumber ? (
            <p className="text-xs text-muted-foreground print:text-gray-600 font-mono">
              Mã hợp đồng: {data.contractNumber}
            </p>
          ) : null}
        </div>

        {/* Hôm nay ngày ... tại địa chỉ ... */}
        <div className="space-y-1 mb-4 text-xs sm:text-sm">
          <p>Hôm nay ngày ……. tháng ……. năm ………….. ; tại địa chỉ:………………………………………………………………………………</p>
          <p>………………………………………………………………………………………</p>
        </div>

        {/* Chúng tôi gồm */}
        <div className="space-y-4 mb-4 text-xs sm:text-sm">
          <p className="font-bold">Chúng tôi gồm:</p>

          {/* 1. Bên A */}
          <div className="space-y-1 pl-2">
            <p className="font-bold">1. Đại diện bên cho thuê phòng trọ (Bên A):</p>
            <p>
              Ông/bà:{" "}
              <strong>
                {data.owner?.name || data.propertyName || "………………………………………………………………………………………………"}
              </strong>{" "}
              Sinh ngày:{" "}
              {data.owner?.birthDate
                ? `${ownerBirth.day} / ${ownerBirth.month} / ${ownerBirth.year}`
                : "…………………………………………"}
            </p>
            <p>
              Nơi đăng ký HK:{" "}
              <strong>
                {data.owner?.hometown ||
                  data.propertyAddress ||
                  "……………………………………………………………………………………………………………………………………………………"}
              </strong>
            </p>
            <p>
              CCCD số: <strong>{data.owner?.idNumber || "………………………………."}</strong> cấp ngày{" "}
              {data.owner?.idDate
                ? `${ownerIdDate.day} / ${ownerIdDate.month} / ${ownerIdDate.year}`
                : "……./ ……. / ………….."}{" "}
              tại <strong>{data.owner?.idPlace || "…………………………………………"}</strong>
            </p>
            <p>
              Số điện thoại:{" "}
              <strong>{data.owner?.phone || "……………………………………………………………………………………………………………………"}</strong>
            </p>
          </div>

          {/* 2. Bên B */}
          <div className="space-y-1 pl-2">
            <p className="font-bold">2. Đại diện bên cho thuê phòng trọ (Bên B):</p>
            <p>
              Ông/bà:{" "}
              <strong>{data.primaryTenant?.fullName || "…………………………………………………………………………"}</strong> Sinh
              ngày:{" "}
              {data.primaryTenant?.birthDate
                ? `${tenantBirth.day} / ${tenantBirth.month} / ${tenantBirth.year}`
                : "…………………………………"}
            </p>
            <p>
              Nơi đăng ký HK:{" "}
              <strong>
                {data.primaryTenant?.hometown ||
                  "……………………………………………………………………………………………………………………………………………………"}
              </strong>
            </p>
            <p>
              CCCD số: <strong>{data.primaryTenant?.idNumber || "………………………………."}</strong> cấp ngày
              ……./ ……. / …………..tại ………………………………………………………………
            </p>
            <p>
              Số điện thoại:{" "}
              <strong>
                {data.primaryTenant?.phone || "……………………………………………………………………………………………………………………"}
              </strong>
            </p>
          </div>
        </div>

        {/* Thỏa thuận */}
        <div className="space-y-3 mb-4 text-xs sm:text-sm">
          <p className="italic">
            Sau khi bàn bạc trên tinh thần dân chủ, hai bên cùng có lợi, cùng thống nhất như sau:
          </p>

          <p>
            Bên A đồng ý cho bên B thuê 01 phòng ở tại địa chỉ:{" "}
            <strong>
              Phòng {data.roomName}
              {data.bedName ? ` (${data.bedName})` : ""} -{" "}
              {data.propertyAddress || data.propertyName}
            </strong>
          </p>

          <p>
            Giá thuê: <strong>{formatMoney(data.rentPrice)}</strong> đ/tháng
          </p>

          <p>
            Hình thức thanh toán:{" "}
            <strong>
              Thanh toán theo chu kỳ {data.billingCycle} tháng / lần (Chuyển khoản hoặc tiền mặt)
            </strong>
          </p>

          <p>
            Tiền điện:{" "}
            <strong>
              {data.electricPrice ? `${formatMoney(data.electricPrice)}` : "Theo biểu giá"}
            </strong>{" "}
            đ/kwh tính theo chỉ số công tơ, thanh toán vào cuối các tháng.
          </p>

          <p>
            Tiền nước:{" "}
            <strong>
              {data.waterPrice
                ? `${formatMoney(data.waterPrice)} đ/${data.waterPricingType === "per_person" ? "người" : "khối"}`
                : "Theo biểu giá"}
            </strong>{" "}
            thanh toán vào đầu các tháng.
          </p>

          <p>
            Tiền đặt cọc: <strong>{formatMoney(data.deposit)}</strong> đ
          </p>

          <p>
            Hợp đồng có giá trị kể từ ngày <strong>{start.day}</strong> tháng{" "}
            <strong>{start.month}</strong> năm <strong>{start.year}</strong> đến ngày{" "}
            <strong>{end.day}</strong> tháng <strong>{end.month}</strong> năm{" "}
            <strong>{end.year}</strong>.
          </p>
        </div>

        {/* Trách nhiệm của các bên */}
        <div className="space-y-3 mb-4 text-xs sm:text-sm">
          <p className="font-bold uppercase tracking-wide">TRÁCH NHIỆM CỦA CÁC BÊN</p>

          <div className="space-y-1 pl-2">
            <p className="font-bold">* Trách nhiệm của bên A:</p>
            <p>– Tạo mọi điều kiện thuận lợi để bên B thực hiện theo hợp đồng.</p>
            <p>– Cung cấp nguồn điện, nước, wifi cho bên B sử dụng.</p>
          </div>

          <div className="space-y-1 pl-2">
            <p className="font-bold">* Trách nhiệm của bên B:</p>
            <p>– Thanh toán đầy đủ các khoản tiền theo đúng thỏa thuận.</p>
            <p>
              – Bảo quản các trang thiết bị và cơ sở vật chất của bên A trang bị cho ban đầu (làm
              hỏng phải sửa, mất phải đền).
            </p>
            <p>
              – Không được tự ý sửa chữa, cải tạo cơ sở vật chất khi chưa được sự đồng ý của bên A.
            </p>
            <p>– Giữ gìn vệ sinh trong và ngoài khuôn viên của phòng trọ.</p>
            <p>
              – Bên B phải chấp hành mọi quy định của pháp luật Nhà nước và quy định của địa phương.
            </p>
            <p>
              – Nếu bên B cho khách ở qua đêm thì phải báo và được sự đồng ý của chủ nhà đồng thời
              phải chịu trách nhiệm về các hành vi vi phạm pháp luật của khách trong thời gian ở
              lại.
            </p>
          </div>
        </div>

        {/* Trách nhiệm chung */}
        <div className="space-y-2 mb-6 text-xs sm:text-sm">
          <p className="font-bold uppercase tracking-wide">TRÁCH NHIỆM CHUNG</p>
          <div className="space-y-1 pl-2">
            <p>– Hai bên phải tạo điều kiện cho nhau thực hiện hợp đồng.</p>
            <p>
              – Trong thời gian hợp đồng còn hiệu lực nếu bên nào vi phạm các điều khoản đã thỏa
              thuận thì bên còn lại có quyền đơn phương chấm dứt hợp đồng; nếu sự vi phạm hợp đồng
              đó gây tổn thất cho bên bị vi phạm hợp đồng thì bên vi phạm hợp đồng phải bồi thường
              thiệt hại.
            </p>
            <p>
              – Một trong hai bên muốn chấm dứt hợp đồng trước thời hạn thì phải báo trước cho bên
              kia ít nhất 30 ngày và hai bên phải có sự thống nhất.
            </p>
            <p>– Bên A phải trả lại tiền đặt cọc cho bên B.</p>
            <p>– Bên nào vi phạm điều khoản chung thì phải chịu trách nhiệm trước pháp luật.</p>
            <p>
              – Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ một bản.
            </p>
          </div>
        </div>

        {/* Chữ ký 2 bên */}
        <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs sm:text-sm">
          <div className="space-y-16">
            <div>
              <p className="font-bold uppercase">ĐẠI DIỆN BÊN A</p>
              <p className="text-xs text-muted-foreground print:text-gray-600 italic">
                (Ký, ghi rõ họ tên)
              </p>
            </div>
            <p className="font-semibold">{data.owner?.name || data.propertyName}</p>
          </div>

          <div className="space-y-16">
            <div>
              <p className="font-bold uppercase">ĐẠI DIỆN BÊN B</p>
              <p className="text-xs text-muted-foreground print:text-gray-600 italic">
                (Ký, ghi rõ họ tên)
              </p>
            </div>
            <p className="font-semibold">{data.primaryTenant?.fullName || "Bên thuê phòng"}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
