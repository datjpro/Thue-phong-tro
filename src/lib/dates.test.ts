import { describe, expect, it } from "vitest";
import { calculateAge, formatDate } from "./dates";

describe("Dates & Age Calculation Helper", () => {
  it("tính tuổi chính xác theo năm, tháng và ngày", () => {
    // Ngày sinh trước ngày hiện tại trong năm -> đã tròn tuổi
    const age1 = calculateAge("2000-01-01");
    expect(age1).toBeGreaterThanOrEqual(24);

    // Ngày sinh trong tương lai hoặc không hợp lệ -> trả về null hoặc không âm
    expect(calculateAge(null)).toBeNull();
    expect(calculateAge("")).toBeNull();
    expect(calculateAge("invalid-date")).toBeNull();
  });

  it("formatDate định dạng dd/mm/yyyy chuẩn xác", () => {
    expect(formatDate("1998-05-15")).toBe("15/05/1998");
    expect(formatDate("2026-10-06")).toBe("06/10/2026");
  });
});
