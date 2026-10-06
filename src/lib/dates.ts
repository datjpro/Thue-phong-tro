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

/** Kỳ hiện tại "YYYY-MM". */
export function currentPeriod(now: Date = new Date()): string {
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
