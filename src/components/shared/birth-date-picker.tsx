"use client";

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
    day: "Ngày",
    month: "Tháng",
    year: "Năm",
  },
}: BirthDatePickerProps) {
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

  // Hàm trigger onChange khi có thay đổi
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
      onChange?.(`${newYear}-${formattedMonth}-${formattedDay}`);
    } else {
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
    "flex h-10 w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="grid grid-cols-3 gap-2" id={id}>
        {/* Chọn Ngày */}
        <div>
          <select
            value={day}
            onChange={(e) => updateDate(e.target.value, month, year)}
            disabled={disabled}
            aria-label="Chọn ngày sinh"
            className={selectClassName}
          >
            <option value="">{placeholder.day || "Ngày"}</option>
            {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={String(d)}>
                Ngày {d < 10 ? `0${d}` : d}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn Tháng */}
        <div>
          <select
            value={month}
            onChange={(e) => updateDate(day, e.target.value, year)}
            disabled={disabled}
            aria-label="Chọn tháng sinh"
            className={selectClassName}
          >
            <option value="">{placeholder.month || "Tháng"}</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={String(m)}>
                Tháng {m < 10 ? `0${m}` : m}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn Năm */}
        <div>
          <select
            value={year}
            onChange={(e) => updateDate(day, month, e.target.value)}
            disabled={disabled}
            aria-label="Chọn năm sinh"
            className={selectClassName}
          >
            <option value="">{placeholder.year || "Năm"}</option>
            {yearOptions.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hiển thị tóm tắt ngày sinh & tuổi hợp lệ */}
      {value && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
          <span className="font-medium text-foreground">{formatDate(value)}</span>
          {age !== null && (
            <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
              {age} tuổi
            </span>
          )}
        </div>
      )}
    </div>
  );
}
