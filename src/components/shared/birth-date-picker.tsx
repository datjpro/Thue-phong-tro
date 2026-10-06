"use client";

import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { calculateAge, formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

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
}: BirthDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const daySelectId = `${uid}-day`;
  const monthSelectId = `${uid}-month`;
  const yearSelectId = `${uid}-year`;

  // Phân tích value (YYYY-MM-DD)
  const parsed = useMemo(() => {
    if (!value || typeof value !== "string") {
      return { day: "", month: "", year: "" };
    }
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return { day: "", month: "", year: "" };
    return {
      year: match[1],
      month: String(Number(match[2])),
      day: String(Number(match[3])),
    };
  }, [value]);

  const [day, setDay] = useState(parsed.day);
  const [month, setMonth] = useState(parsed.month);
  const [year, setYear] = useState(parsed.year);
  const [displayInput, setDisplayInput] = useState("");

  // Đồng bộ display text dạng dd/mm/yyyy khi value thay đổi
  useEffect(() => {
    setDay(parsed.day);
    setMonth(parsed.month);
    setYear(parsed.year);
    if (parsed.day && parsed.month && parsed.year) {
      const d = parsed.day.padStart(2, "0");
      const m = parsed.month.padStart(2, "0");
      setDisplayInput(`${d}/${m}/${parsed.year}`);
    } else {
      setDisplayInput("");
    }
  }, [parsed]);

  // Click outside to close popup
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Tính số ngày tối đa trong tháng đã chọn
  const daysInSelectedMonth = useMemo(() => {
    if (!month) return 31;
    const m = Number(month);
    const y = year ? Number(year) : 2024;
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

  // Xử lý khi chọn Ngày / Tháng / Năm trong Popup
  function handleSelectPart(newDay: string, newMonth: string, newYear: string) {
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
      setDisplayInput(`${formattedDay}/${formattedMonth}/${newYear}`);
      onChange?.(`${newYear}-${formattedMonth}-${formattedDay}`);
    } else {
      setDisplayInput("");
      onChange?.("");
    }
  }

  // Xử lý khi gõ trực tiếp vào ô input dạng dd/mm/yyyy
  function handleDirectTyping(raw: string) {
    let clean = raw.replace(/[^\d/]/g, "");

    // Tự động chèn / khi gõ liền số (ví dụ: 15082000 -> 15/08/2000)
    if (!raw.includes("/") && clean.length > 2) {
      if (clean.length <= 4) {
        clean = `${clean.slice(0, 2)}/${clean.slice(2)}`;
      } else {
        clean = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4, 8)}`;
      }
    }

    setDisplayInput(clean);

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

    if (!clean.trim()) {
      setDay("");
      setMonth("");
      setYear("");
      onChange?.("");
    }
  }

  function handleClear() {
    setDay("");
    setMonth("");
    setYear("");
    setDisplayInput("");
    onChange?.("");
  }

  const age = useMemo(() => {
    if (value && showAge) {
      return calculateAge(value);
    }
    return null;
  }, [value, showAge]);

  return (
    <div ref={containerRef} className={cn("relative space-y-1", className)}>
      {/* Ô nhập ngày tháng năm duy nhất - hiển thị thuần túy con số dạng d/m/y */}
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={displayInput}
          onChange={(e) => handleDirectTyping(e.target.value)}
          placeholder="dd/mm/yyyy (vd: 15/08/2000)"
          maxLength={10}
          inputMode="numeric"
          disabled={disabled}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-20 text-sm font-medium tabular-nums text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        />

        {/* Nút thao tác bên trong ô: Xóa & Mở bộ chọn */}
        <div className="absolute right-1.5 flex items-center gap-1">
          {value ? (
            <button
              type="button"
              disabled={disabled}
              onClick={handleClear}
              title="Xóa ngày"
              className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          ) : null}

          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(!open)}
            title="Mở bảng chọn ngày"
            className={cn(
              "flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              open ? "bg-primary/10 text-primary" : "",
            )}
          >
            <CalendarIcon size={16} />
          </button>
        </div>
      </div>

      {/* Hiển thị tóm tắt tuổi hợp lệ */}
      {value && age !== null ? (
        <div className="flex items-center gap-1.5 px-0.5 text-xs text-muted-foreground">
          <span>Đã chọn:</span>
          <span className="font-semibold text-foreground">{formatDate(value)}</span>
          <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.2 text-[11px] font-semibold text-primary">
            {age} tuổi
          </span>
        </div>
      ) : null}

      {/* Bảng Popover chọn Ngày / Tháng / Năm mượt mà */}
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[280px] max-w-sm rounded-xl border border-border/80 bg-card p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
            <span className="text-xs font-bold text-foreground">Chọn Ngày / Tháng / Năm</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Cột Ngày */}
            <div>
              <label
                htmlFor={daySelectId}
                className="text-[11px] font-semibold text-muted-foreground block mb-1"
              >
                Ngày
              </label>
              <select
                id={daySelectId}
                value={day}
                onChange={(e) => handleSelectPart(e.target.value, month, year)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">--</option>
                {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => {
                  const val = String(d);
                  const label = d < 10 ? `0${d}` : String(d);
                  return (
                    <option key={d} value={val}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Cột Tháng */}
            <div>
              <label
                htmlFor={monthSelectId}
                className="text-[11px] font-semibold text-muted-foreground block mb-1"
              >
                Tháng
              </label>
              <select
                id={monthSelectId}
                value={month}
                onChange={(e) => handleSelectPart(day, e.target.value, year)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">--</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const val = String(m);
                  const label = m < 10 ? `0${m}` : String(m);
                  return (
                    <option key={m} value={val}>
                      Tháng {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Cột Năm */}
            <div>
              <label
                htmlFor={yearSelectId}
                className="text-[11px] font-semibold text-muted-foreground block mb-1"
              >
                Năm
              </label>
              <select
                id={yearSelectId}
                value={year}
                onChange={(e) => handleSelectPart(day, month, e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">--</option>
                {yearOptions.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nút Xong */}
          <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-2xs hover:bg-primary/90 transition-colors"
            >
              <Check size={13} />
              <span>Xong</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
