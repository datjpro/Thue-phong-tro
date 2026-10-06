"use client";

import { Calendar, Edit3, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { calculateAge, formatDate } from "@/lib/dates";

interface BirthDatePickerProps {
  id?: string;
  value?: string | null;
  onChange?: (val: string) => void;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  showAge?: boolean;
  className?: string;
  placeholder?: {
    day?: string;
    month?: string;
    year?: string;
  };
}

export function BirthDatePicker({
  id,
  value,
  onChange,
  disabled = false,
  minYear = 1930,
  maxYear = new Date().getFullYear(),
  showAge = true,
  className = "",
  placeholder = {
    day: "Ngày (dd)",
    month: "Tháng (mm)",
    year: "Năm (yyyy)",
  },
}: BirthDatePickerProps) {
  // Mode: "select" (3 dropdowns) hoặc "text" (gõ dd/mm/yyyy)
  const [inputMode, setInputMode] = useState<"select" | "text">("select");
  const [textInput, setTextInput] = useState("");

  // Phân tích value (YYYY-MM-DD)
  const parsed = useMemo(() => {
    if (!value || typeof value !== "string") {
      return { day: "", month: "", year: "" };
    }
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return { day: "", month: "", year: "" };
    return {
      year: match[1],
      month: String(Number(match[2])), // Bỏ leading zero để khớp value trong option
      day: String(Number(match[3])),
    };
  }, [value]);

  const [day, setDay] = useState(parsed.day);
  const [month, setMonth] = useState(parsed.month);
  const [year, setYear] = useState(parsed.year);

  // Đồng bộ khi value bên ngoài thay đổi (ví dụ OCR scan hoặc form.reset)
  useEffect(() => {
    setDay(parsed.day);
    setMonth(parsed.month);
    setYear(parsed.year);
    if (parsed.day && parsed.month && parsed.year) {
      const d = parsed.day.padStart(2, "0");
      const m = parsed.month.padStart(2, "0");
      setTextInput(`${d}/${m}/${parsed.year}`);
    } else {
      setTextInput("");
    }
  }, [parsed]);

  // Tính số ngày tối đa trong tháng đã chọn
  const daysInSelectedMonth = useMemo(() => {
    if (!month) return 31;
    const m = Number(month);
    const y = year ? Number(year) : 2024; // Mặc định năm nhuận nếu chưa chọn năm
    return new Date(y, m, 0).getDate();
  }, [month, year]);

  // Danh sách các năm (giảm dần từ maxYear đến minYear)
  const yearOptions = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  // Hàm trigger onChange khi có thay đổi từ dropdown
  function updateDate(newDay: string, newMonth: string, newYear: string) {
    let finalDay = newDay;
    if (newDay && newMonth) {
      const maxDays = new Date(newYear ? Number(newYear) : 2024, Number(newMonth), 0).getDate();
      if (Number(newDay) > maxDays) {
        finalDay = String(maxDays);
      }
    }

    setDay(finalDay);
    setMonth(newMonth);
    setYear(newYear);

    if (finalDay && newMonth && newYear) {
      const formattedMonth = newMonth.padStart(2, "0");
      const formattedDay = finalDay.padStart(2, "0");
      setTextInput(`${formattedDay}/${formattedMonth}/${newYear}`);
      onChange?.(`${newYear}-${formattedMonth}-${formattedDay}`);
    } else {
      setTextInput("");
      onChange?.("");
    }
  }

  // Xử lý nhập text dạng dd/mm/yyyy
  function handleTextChange(raw: string) {
    // Chỉ giữ lại số và dấu /
    let clean = raw.replace(/[^\d/]/g, "");

    // Tự động chèn / khi gõ liền số (ví dụ 15082000 -> 15/08/2000)
    if (!raw.includes("/") && clean.length > 2) {
      if (clean.length <= 4) {
        clean = `${clean.slice(0, 2)}/${clean.slice(2)}`;
      } else {
        clean = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4, 8)}`;
      }
    }

    setTextInput(clean);

    // Kiểm tra định dạng dd/mm/yyyy hoàn chỉnh
    const parts = clean.split("/");
    if (parts.length === 3) {
      const d = Number(parts[0]);
      const m = Number(parts[1]);
      const y = Number(parts[2]);

      if (
        !Number.isNaN(d) &&
        !Number.isNaN(m) &&
        !Number.isNaN(y) &&
        m >= 1 &&
        m <= 12 &&
        y >= minYear &&
        y <= maxYear
      ) {
        const maxD = new Date(y, m, 0).getDate();
        if (d >= 1 && d <= maxD) {
          const formattedMonth = String(m).padStart(2, "0");
          const formattedDay = String(d).padStart(2, "0");
          setDay(String(d));
          setMonth(String(m));
          setYear(String(y));
          onChange?.(`${y}-${formattedMonth}-${formattedDay}`);
          return;
        }
      }
    }

    // Nếu xóa rỗng
    if (!clean.trim()) {
      setDay("");
      setMonth("");
      setYear("");
      onChange?.("");
    }
  }

  const age = useMemo(() => {
    if (value && showAge) {
      return calculateAge(value);
    }
    return null;
  }, [value, showAge]);

  const selectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {inputMode === "select" ? (
        /* Giao diện chọn 3 ô Ngày / Tháng / Năm thuần số theo form d/m/y */
        <div className="flex items-center gap-1.5" id={id}>
          <div className="grid grid-cols-3 gap-1.5 flex-1 min-w-0">
            {/* Chọn Ngày (dd) */}
            <div>
              <select
                value={day}
                onChange={(e) => updateDate(e.target.value, month, year)}
                disabled={disabled}
                aria-label="Chọn ngày (dd)"
                className={selectClassName}
              >
                <option value="">{placeholder.day || "Ngày (dd)"}</option>
                {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => {
                  const formatted = d < 10 ? `0${d}` : String(d);
                  return (
                    <option key={d} value={String(d)}>
                      {formatted}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Chọn Tháng (mm) */}
            <div>
              <select
                value={month}
                onChange={(e) => updateDate(day, e.target.value, year)}
                disabled={disabled}
                aria-label="Chọn tháng (mm)"
                className={selectClassName}
              >
                <option value="">{placeholder.month || "Tháng (mm)"}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const formatted = m < 10 ? `0${m}` : String(m);
                  return (
                    <option key={m} value={String(m)}>
                      {formatted}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Chọn Năm (yyyy) */}
            <div>
              <select
                value={year}
                onChange={(e) => updateDate(day, month, e.target.value)}
                disabled={disabled}
                aria-label="Chọn năm (yyyy)"
                className={selectClassName}
              >
                <option value="">{placeholder.year || "Năm (yyyy)"}</option>
                {yearOptions.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nút chuyển sang chế độ gõ text d/m/y */}
          <button
            type="button"
            onClick={() => setInputMode("text")}
            title="Gõ ngày theo định dạng dd/mm/yyyy"
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-input bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Edit3 size={15} />
          </button>
        </div>
      ) : (
        /* Giao diện gõ nhanh dd/mm/yyyy */
        <div className="flex items-center gap-1.5" id={id}>
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={textInput}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="dd/mm/yyyy (vd: 15/08/2000)"
              maxLength={10}
              inputMode="numeric"
              disabled={disabled}
              className={selectClassName}
            />
          </div>

          {/* Nút chuyển về chọn dropdown */}
          <button
            type="button"
            onClick={() => setInputMode("select")}
            title="Chọn theo ô Ngày / Tháng / Năm"
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-input bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Calendar size={15} />
          </button>
        </div>
      )}

      {/* Hiển thị tóm tắt ngày sinh theo form d/m/y & tuổi hợp lệ */}
      {value ? (
        <div className="flex items-center justify-between gap-1.5 text-xs text-muted-foreground pt-0.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{formatDate(value)}</span>
            {age !== null && (
              <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                {age} tuổi
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setDay("");
              setMonth("");
              setYear("");
              setTextInput("");
              onChange?.("");
            }}
            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-0.5"
            title="Xóa ngày đã chọn"
          >
            <RotateCcw size={11} />
            Xóa
          </button>
        </div>
      ) : null}
    </div>
  );
}
