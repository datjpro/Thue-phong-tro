import { daysInPeriod } from "@/lib/dates";

export type TierConfig = {
  upTo: number | null; // null biểu thị mức cao nhất (không giới hạn trên)
  unitPrice: number;
};

export const DEFAULT_EVN_ELECTRIC_TIERS: TierConfig[] = [
  { upTo: 50, unitPrice: 1893 },
  { upTo: 100, unitPrice: 1956 },
  { upTo: 200, unitPrice: 2271 },
  { upTo: 300, unitPrice: 2860 },
  { upTo: 400, unitPrice: 3197 },
  { upTo: null, unitPrice: 3302 },
];

export type MeterInput = {
  prev: number;
  curr: number;
  unitPrice: number;
  pricingType?: "fixed" | "tiered";
  tiers?: TierConfig[];
};

export type WaterInput = {
  prev?: number;
  curr?: number;
  unitPrice?: number;
  pricingType?: "meter" | "per_person";
  personCount?: number;
  pricePerPerson?: number;
};

export type ServiceItemInput = {
  name: string;
  amount: number;
  quantity?: number;
};

export type InvoiceInput = {
  period: string; // "YYYY-MM"
  monthlyRent: number;
  contractStart: string; // "YYYY-MM-DD"
  contractEnd: string | null;
  electric: MeterInput;
  water: WaterInput;
  otherFee?: number;
  serviceItems?: ServiceItemInput[];
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
  serviceAmount: number;
  total: number;
};

/**
 * Tính tiền điện theo bậc thang lũy tiến.
 */
export function calculateTieredUsage(usage: number, tiers: TierConfig[]): number {
  if (usage <= 0) return 0;
  let remaining = usage;
  let total = 0;
  let prevLimit = 0;

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const bracketSize = tier.upTo !== null ? tier.upTo - prevLimit : Number.POSITIVE_INFINITY;
    const consumedInBracket = Math.min(remaining, bracketSize);

    total += consumedInBracket * tier.unitPrice;
    remaining -= consumedInBracket;

    if (tier.upTo !== null) {
      prevLimit = tier.upTo;
    }
  }

  return Math.round(total);
}

function electricAmount(m: MeterInput): { usage: number; amount: number } {
  const usage = m.curr - m.prev;
  if (usage < 0) {
    throw new RangeError("Chỉ số mới nhỏ hơn chỉ số cũ");
  }
  if (m.pricingType === "tiered") {
    const tiers = m.tiers && m.tiers.length > 0 ? m.tiers : DEFAULT_EVN_ELECTRIC_TIERS;
    return { usage, amount: calculateTieredUsage(usage, tiers) };
  }
  return { usage, amount: Math.round(usage * m.unitPrice) };
}

function waterAmount(w: WaterInput): { usage: number; amount: number } {
  if (w.pricingType === "per_person") {
    const count = w.personCount && w.personCount > 0 ? w.personCount : 1;
    const price = w.pricePerPerson ?? 100000;
    const usage = w.curr !== undefined && w.prev !== undefined ? Math.max(0, w.curr - w.prev) : 0;
    return { usage, amount: Math.round(count * price) };
  }

  const prev = w.prev ?? 0;
  const curr = w.curr ?? 0;
  const unitPrice = w.unitPrice ?? 25000;
  const usage = curr - prev;
  if (usage < 0) {
    throw new RangeError("Chỉ số nước mới nhỏ hơn chỉ số cũ");
  }
  return { usage, amount: Math.round(usage * unitPrice) };
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

  const e = electricAmount(input.electric);
  const w = waterAmount(input.water);

  const servicesSum = input.serviceItems
    ? input.serviceItems.reduce((acc, s) => acc + s.amount, 0)
    : 0;
  const otherFee = (input.otherFee ?? 0) + servicesSum;

  return {
    occupiedDays,
    daysInMonth: dim,
    roomFee,
    electricUsage: e.usage,
    electricAmount: e.amount,
    waterUsage: w.usage,
    waterAmount: w.amount,
    otherFee,
    serviceAmount: servicesSum,
    total: roomFee + e.amount + w.amount + otherFee,
  };
}

/** Trạng thái hóa đơn theo số tiền đã thu. */
export function paymentStatus(total: number, paid: number): "unpaid" | "partial" | "paid" {
  if (paid >= total) return "paid";
  return paid > 0 ? "partial" : "unpaid";
}
