import { describe, expect, it } from "vitest";
import { calculateAge, calendarPeriod, currentPeriod, dueDateFor, formatDate } from "./dates";

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

  it("currentPeriod trả về tháng trước khi đang ở đầu/giữa tháng (mô hình Trả Sau)", () => {
    // Ngày 06/10/2026 -> Kỳ cần chốt & thu là Tháng 09/2026
    const earlyMonth = new Date("2026-10-06T10:00:00Z");
    expect(currentPeriod(earlyMonth)).toBe("2026-09");
    expect(calendarPeriod(earlyMonth)).toBe("2026-10");

    // Ngày 26/10/2026 -> Chuẩn bị cho kỳ Tháng 10/2026
    const lateMonth = new Date("2026-10-26T10:00:00Z");
    expect(currentPeriod(lateMonth)).toBe("2026-10");
  });

  it("dueDateFor tính đúng hạn đóng tiền ở tháng tiếp theo", () => {
    // Kỳ 09/2026, dueDay = 5 -> Hạn là 05/10/2026
    expect(dueDateFor("2026-09", 5)).toBe("2026-10-05");
    // Kỳ 12/2026, dueDay = 10 -> Hạn là 10/01/2027
    expect(dueDateFor("2026-12", 10)).toBe("2027-01-10");
  });
});
