import { describe, expect, it } from "vitest";
import { calculateInvoice, paymentStatus } from "./calculate";

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

describe("paymentStatus", () => {
  it("chưa thu / một phần / đã thu / thừa tiền", () => {
    expect(paymentStatus(1000, 0)).toBe("unpaid");
    expect(paymentStatus(1000, 400)).toBe("partial");
    expect(paymentStatus(1000, 1000)).toBe("paid");
    expect(paymentStatus(1000, 1200)).toBe("paid");
  });
});
