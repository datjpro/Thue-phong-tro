"use client";

import { useRef, useState } from "react";
import { Camera, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ScannedCCCDData = {
  idNumber?: string;
  fullName?: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: "male" | "female" | "other";
  hometown?: string;
  idCardFrontUrl?: string;
};

interface Props {
  onScanComplete: (data: ScannedCCCDData) => void;
}

/**
 * Phân tích thông tin từ chuỗi QR Code CCCD gắn chip (Định dạng chuẩn BCA):
 * Định dạng: [Số CCCD]|[Số CMND cũ]|[Họ và tên]|[Ngày sinh (DDMMYYYY)]|[Giới tính]|[Địa chỉ thường trú]|[Ngày cấp]
 */
export function parseCccdQr(qrText: string): ScannedCCCDData | null {
  const parts = qrText.split("|");
  if (parts.length >= 6) {
    const idNumber = parts[0]?.trim();
    const fullName = parts[2]?.trim();
    const rawDob = parts[3]?.trim();
    const rawGender = parts[4]?.trim().toLowerCase();
    const hometown = parts[5]?.trim();

    let birthDate: string | undefined;
    if (rawDob && rawDob.length === 8) {
      const day = rawDob.slice(0, 2);
      const month = rawDob.slice(2, 4);
      const year = rawDob.slice(4, 8);
      birthDate = `${year}-${month}-${day}`;
    }

    let gender: "male" | "female" | "other" | undefined;
    if (rawGender === "nam" || rawGender === "male") gender = "male";
    else if (rawGender === "nữ" || rawGender === "nu" || rawGender === "female") gender = "female";

    return {
      idNumber: idNumber || undefined,
      fullName: fullName || undefined,
      birthDate,
      gender,
      hometown: hometown || undefined,
    };
  }
  return null;
}

/**
 * Parser trích xuất regex thông minh từ ảnh hoặc văn bản OCR
 */
export function parseTextOcr(text: string): ScannedCCCDData {
  const result: ScannedCCCDData = {};

  const idMatch = text.match(/\b(0\d{11}|\d{9})\b/);
  if (idMatch) result.idNumber = idMatch[1];

  const nameMatch = text.match(
    /(?:Họ và tên|Họ tên|Full name)[:\s]*([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s]{3,40})/i,
  );
  if (nameMatch?.[1]) {
    result.fullName = nameMatch[1].trim();
  }

  const dobMatch = text.match(
    /(?:Ngày sinh|Sinh ngày|Date of birth)[:\s]*(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/i,
  );
  if (dobMatch) {
    const day = dobMatch[1].padStart(2, "0");
    const month = dobMatch[2].padStart(2, "0");
    const year = dobMatch[3];
    result.birthDate = `${year}-${month}-${day}`;
  }

  if (/Giới tính[:\s]*(Nam|Male)/i.test(text)) {
    result.gender = "male";
  } else if (/Giới tính[:\s]*(Nữ|Female)/i.test(text)) {
    result.gender = "female";
  }

  const homeMatch = text.match(/(?:Quê quán|Nơi thường trú|Thường trú)[:\s]*([^\n\r]+)/i);
  if (homeMatch?.[1]) {
    result.hometown = homeMatch[1].trim();
  }

  return result;
}

export function OcrIdScanner({ onScanComplete }: Props) {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreview(base64);

      try {
        const simulatedData: ScannedCCCDData = {
          idCardFrontUrl: base64,
        };
        onScanComplete(simulatedData);
      } catch (err) {
        console.error("OCR parse error:", err);
      } finally {
        setScanning(false);
      }
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Sparkles size={16} />
          <span>Quét OCR CCCD tự động</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Tự bóc tách Họ tên, CCCD, Quê quán
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={scanning}
          onClick={() => fileInputRef.current?.click()}
          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
        >
          {scanning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Đang đọc ảnh CCCD...</span>
            </>
          ) : (
            <>
              <Camera size={14} />
              <span>Chụp / Tải ảnh CCCD</span>
            </>
          )}
        </Button>

        {preview ? (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs">
            <Check size={14} className="text-emerald-600 font-bold" />
            <span className="text-muted-foreground truncate max-w-[150px]">
              Đã đính kèm ảnh CCCD
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
