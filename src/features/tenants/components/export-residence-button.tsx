"use client";

import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, todayVn } from "@/lib/dates";
import type { TenantRow } from "../queries";

interface Props {
  tenants: TenantRow[];
}

export function ExportResidenceButton({ tenants }: Props) {
  function handleExportCsv() {
    if (tenants.length === 0) return;

    const propertyName = tenants[0]?.propertyName || "Nhà trọ";
    const propertyAddress = tenants[0]?.propertyAddress || "";
    const today = todayVn();

    const headers = [
      "STT",
      "Họ và tên",
      "Ngày sinh",
      "Giới tính",
      "Số CCCD/Định danh",
      "Quê quán / Thường trú",
      "Nơi làm việc / Trường học",
      "Biển số xe",
      "Số điện thoại",
      "Phòng ở",
      "Ngày bắt đầu thuê",
    ];

    const rows = tenants.map((t, index) => {
      const genderLabel =
        t.gender === "male" ? "Nam" : t.gender === "female" ? "Nữ" : t.gender ? "Khác" : "";
      return [
        index + 1,
        `"${(t.fullName || "").replace(/"/g, '""')}"`,
        `"${t.birthDate ? formatDate(t.birthDate) : ""}"`,
        `"${genderLabel}"`,
        t.idNumber ? `="${t.idNumber.replace(/"/g, '""')}"` : `""`,
        `"${(t.hometown || "").replace(/"/g, '""')}"`,
        `"${(t.workplace || "").replace(/"/g, '""')}"`,
        `"${(t.licensePlate || "").replace(/"/g, '""')}"`,
        t.phone ? `="${t.phone.replace(/"/g, '""')}"` : `""`,
        `"${(t.roomName ? `Phòng ${t.roomName}` : "Chưa gắn phòng").replace(/"/g, '""')}"`,
        `"${t.startDate ? formatDate(t.startDate) : ""}"`,
      ];
    });

    const csvContent =
      "\uFEFF" + // UTF-8 BOM để Excel hiển thị tiếng Việt không bị lỗi font
      `DANH SÁCH KHAI BÁO TẠM TRÚ / LƯU TRÚ (MẪU CT01 CHUẨN BCA)\n` +
      `Cơ sở lưu trú: ${propertyName} - Địa chỉ: ${propertyAddress}\n` +
      `Ngày xuất dữ liệu: ${formatDate(today)}\n\n` +
      headers.join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Khai_bao_tam_tru_${propertyName.replace(/\s+/g, "_")}_${today}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExportCsv}
      disabled={tenants.length === 0}
      className="gap-1.5 border-border/80 shadow-2xs hover:bg-muted"
    >
      <FileSpreadsheet size={15} className="text-emerald-600" />
      <span>Xuất danh sách tạm trú (CT01)</span>
    </Button>
  );
}
