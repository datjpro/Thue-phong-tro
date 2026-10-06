import { describe, expect, it } from "vitest";
import { calculateInvoice, calculateTieredUsage, paymentStatus } from "./calculate";

const base = {
  period: "2026-10",
  monthlyRent: 3_000_000,
  contractStart: "2026-01-01",
  contractEnd: null,
  electric: { prev: 100, curr: 185, unitPrice: 3500 },
  water: { prev: 10, curr: 14, unitPrice: 25_000 },
};

describe("calculateInvoice", () => {
  it("tính tháng trọn vẹn: điện 85 số, nước 4 khối", () => {
    const r = calculateInvoice(base);
    expect(r.roomFee).toBe(3_000_000);
    expect(r.electricAmount).toBe(297_500);
    expect(r.waterAmount).toBe(100_000);
    expect(r.total).toBe(3_397_500);
  });

  it("tháng đầu hợp đồng tính theo ngày ở", () => {
    const r = calculateInvoice({ ...base, contractStart: "2026-10-16" });
    expect(r.occupiedDays).toBe(16);
    expect(r.roomFee).toBe(Math.round((3_000_000 * 16) / 31));
  });

  it("tháng cuối hợp đồng tính theo ngày ở", () => {
    const r = calculateInvoice({ ...base, contractEnd: "2026-10-10" });
    expect(r.occupiedDays).toBe(10);
    expect(r.roomFee).toBe(Math.round((3_000_000 * 10) / 31));
  });

  it("làm tròn đến đồng, kết quả luôn là số nguyên", () => {
    const r = calculateInvoice({ ...base, monthlyRent: 2_999_999, contractStart: "2026-10-04" });
    expect(Number.isInteger(r.roomFee)).toBe(true);
    expect(Number.isInteger(r.total)).toBe(true);
  });

  it("tháng 2 có 28 ngày", () => {
    const r = calculateInvoice({ ...base, period: "2027-02" });
    expect(r.daysInMonth).toBe(28);
    expect(r.roomFee).toBe(3_000_000);
  });

  it("cộng phí khác vào tổng", () => {
    expect(calculateInvoice({ ...base, otherFee: 50_000 }).total).toBe(3_447_500);
  });

  it("tính tiền nước theo đầu người", () => {
    const r = calculateInvoice({
      ...base,
      water: {
        pricingType: "per_person",
        personCount: 3,
        pricePerPerson: 80_000,
      },
    });
    expect(r.waterAmount).toBe(240_000);
  });

  it("tính tiền điện theo bậc thang lũy tiến", () => {
    // 75 số: 50 số bậc 1 (2000) + 25 số bậc 2 (2500) = 100_000 + 62_500 = 162_500
    const customTiers = [
      { upTo: 50, unitPrice: 2000 },
      { upTo: 100, unitPrice: 2500 },
      { upTo: null, unitPrice: 3000 },
    ];
    const r = calculateInvoice({
      ...base,
      electric: {
        prev: 100,
        curr: 175,
        unitPrice: 0,
        pricingType: "tiered",
        tiers: customTiers,
      },
    });
    expect(r.electricUsage).toBe(75);
    expect(r.electricAmount).toBe(162_500);
  });

  it("cộng dồn dịch vụ đi kèm vào tổng", () => {
    const r = calculateInvoice({
      ...base,
      serviceItems: [
        { name: "Phí rác", amount: 30_000 },
        { name: "Giữ xe máy (2 xe)", amount: 200_000 },
        { name: "Wifi", amount: 50_000 },
      ],
    });
    expect(r.serviceAmount).toBe(280_000);
    expect(r.otherFee).toBe(280_000);
    expect(r.total).toBe(3_000_000 + 297_500 + 100_000 + 280_000);
  });

  it("từ chối chỉ số mới nhỏ hơn cũ", () => {
    expect(() =>
      calculateInvoice({ ...base, electric: { prev: 200, curr: 100, unitPrice: 3500 } }),
    ).toThrow(RangeError);
  });

  it("không dùng điện nước vẫn hợp lệ", () => {
    const r = calculateInvoice({ ...base, electric: { prev: 5, curr: 5, unitPrice: 3500 } });
    expect(r.electricAmount).toBe(0);
  });
});

describe("calculateTieredUsage helper", () => {
  it("tính chính xác khi qua nhiều bậc", () => {
    const tiers = [
      { upTo: 50, unitPrice: 1000 },
      { upTo: 100, unitPrice: 2000 },
      { upTo: null, unitPrice: 3000 },
    ];
    // 120 số: 50*1000 + 50*2000 + 20*3000 = 50k + 100k + 60k = 210k
    expect(calculateTieredUsage(120, tiers)).toBe(210_000);
  });
});

describe("paymentStatus", () => {
  it("chưa thu / một phần / đã thu / thừa tiền", () => {
    expect(paymentStatus(1000, 0)).toBe("unpaid");
    expect(paymentStatus(1000, 400)).toBe("partial");
    expect(paymentStatus(1000, 1000)).toBe("paid");
    expect(paymentStatus(1000, 1200)).toBe("paid");
  });
});
