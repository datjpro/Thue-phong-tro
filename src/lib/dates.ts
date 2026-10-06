const TZ = "Asia/Ho_Chi_Minh";

/** Ngày hôm nay theo giờ Việt Nam, dạng "YYYY-MM-DD" (máy chủ chạy UTC nên không dùng toISOString). */
export function todayVn(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Kỳ hóa đơn theo mô hình Trả Sau (Cách 2):
 * - Vào đầu tháng và trong suốt chu kỳ thu tiền (từ ngày 1 đến ngày 24 hàng tháng),
 *   kỳ hóa đơn cần chốt số, lập hóa đơn và thu tiền là THÁNG VỪA QUA (tháng trước).
 *   Ví dụ: Hôm nay là 06/10/2026 -> Kỳ hóa đơn là "2026-09" (Tháng 09/2026), hạn đóng tiền vào đầu tháng 10.
 * - Từ ngày 25 trở đi: chuyển sang chuẩn bị cho kỳ tháng hiện tại.
 */
export function currentPeriod(now: Date = new Date()): string {
  const today = todayVn(now);
  const day = Number(today.slice(8, 10));
  const currentMonth = today.slice(0, 7);
  if (day < 25) {
    return prevPeriod(currentMonth);
  }
  return currentMonth;
}

/** Tháng theo lịch dương "YYYY-MM" (ví dụ: ngày 06/10/2026 -> "2026-10") */
export function calendarPeriod(now: Date = new Date()): string {
  return todayVn(now).slice(0, 7);
}

export function prevPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

export function nextPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function daysInPeriod(period: string): number {
  const [y, m] = period.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** "2026-10" -> "10/2026" */
export function formatPeriodShort(period: string): string {
  const [y, m] = period.split("-");
  return `${m}/${y}`;
}

/** "2026-11-05" hoặc Date -> "05/11/2026" (date thuần không bị lệch múi giờ). */
export function formatDate(value: string | Date): string {
  if (typeof value === "string") {
    const [y, m, d] = value.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  }
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

/** Ngày hạn đóng tiền của kỳ: ngày `dueDay` của tháng kế tiếp. */
export function dueDateFor(period: string, dueDay: number): string {
  const [y, m] = period.split("-").map(Number);
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  const day = Math.min(dueDay, daysInPeriod(`${ny}-${String(nm).padStart(2, "0")}`));
  return `${ny}-${String(nm).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Tính tuổi từ ngày sinh (YYYY-MM-DD hoặc Date) */
export function calculateAge(birthDate: string | Date | null | undefined): number | null {
  if (!birthDate) return null;
  const str = typeof birthDate === "string" ? birthDate.slice(0, 10) : todayVn(birthDate);
  const parts = str.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [birthYear, birthMonth, birthDay] = parts;
  const [todayYear, todayMonth, todayDay] = todayVn().split("-").map(Number);

  let age = todayYear - birthYear;
  if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
    age--;
  }
  return age >= 0 ? age : null;
}
