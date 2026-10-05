/** Tiền luôn là số nguyên VND. Mọi hiển thị đi qua đây: `3.397.500 ₫`. */
export function formatMoney(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.abs(Math.round(amount)).toString();
  return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;
}

/** Số có dấu chấm ngăn nghìn, không kèm đơn vị (dùng trong ô nhập). */
export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** "3.500.000" | "3500000" | "" -> số nguyên; chuỗi không hợp lệ -> 0. */
export function parseNumber(input: string): number {
  const digits = input.replace(/\D/g, "");
  return digits === "" ? 0 : Number.parseInt(digits, 10);
}
