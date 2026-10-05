import { daysInPeriod } from "@/lib/dates";

export type MeterInput = { prev: number; curr: number; unitPrice: number };

export type InvoiceInput = {
  period: string; // "YYYY-MM"
  monthlyRent: number;
  contractStart: string; // "YYYY-MM-DD"
  contractEnd: string | null;
  electric: MeterInput;
  water: MeterInput;
  otherFee?: number;
};

export type InvoiceCalculation = {
  occupiedDays: number;
  daysInMonth: number;
  roomFee: number;
  electricUsage: number;
  electricAmount: number;
  waterUsage: number;
  waterAmount: number;
  otherFee: number;
  total: number;
};

function meterAmount(m: MeterInput): { usage: number; amount: number } {
  const usage = m.curr - m.prev;
  if (usage < 0) {
    // Chỉ số mới nhỏ hơn cũ: giao diện phải cho người dùng chọn "Thay đồng hồ" trước khi tới đây.
    throw new RangeError("Chỉ số mới nhỏ hơn chỉ số cũ");
  }
  return { usage, amount: Math.round(usage * m.unitPrice) };
}

/**
 * Tính hóa đơn một kỳ. Tháng đầu/cuối của hợp đồng tính tiền phòng theo số ngày ở thực tế
 * (làm tròn đến đồng); tháng trọn vẹn giữ nguyên giá thuê để không phát sinh sai số.
 */
export function calculateInvoice(input: InvoiceInput): InvoiceCalculation {
  const dim = daysInPeriod(input.period);
  const periodStart = `${input.period}-01`;
  const periodEnd = `${input.period}-${String(dim).padStart(2, "0")}`;

  const from = input.contractStart > periodStart ? input.contractStart : periodStart;
  const to = input.contractEnd && input.contractEnd < periodEnd ? input.contractEnd : periodEnd;

  const dayMs = 86_400_000;
  const occupiedDays =
    from > to
      ? 0
      : Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / dayMs) + 1;

  const roomFee =
    occupiedDays === dim ? input.monthlyRent : Math.round((input.monthlyRent * occupiedDays) / dim);

  const e = meterAmount(input.electric);
  const w = meterAmount(input.water);
  const otherFee = input.otherFee ?? 0;

  return {
    occupiedDays,
    daysInMonth: dim,
    roomFee,
    electricUsage: e.usage,
    electricAmount: e.amount,
    waterUsage: w.usage,
    waterAmount: w.amount,
    otherFee,
    total: roomFee + e.amount + w.amount + otherFee,
  };
}

/** Trạng thái hóa đơn theo số tiền đã thu. */
export function paymentStatus(total: number, paid: number): "unpaid" | "partial" | "paid" {
  if (paid >= total) return "paid";
  return paid > 0 ? "partial" : "unpaid";
}
