import { describe, expect, it } from "vitest";
import { decryptData, encryptData, maskIdNumber, maskPhone } from "./crypto";

describe("Crypto & Data Protection Module", () => {
  it("mã hóa và giải mã chính xác chuỗi văn bản (AES-256-GCM)", () => {
    const originalText = "001200009876";
    const encrypted = encryptData(originalText);

    expect(encrypted).not.toBe(originalText);
    expect(encrypted.split(".").length).toBe(3); // iv.authTag.cipherText

    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it("không bị lỗi khi giải mã chuỗi rỗng hoặc chuỗi thô", () => {
    expect(decryptData("")).toBe("");
    expect(decryptData("plain-text-without-dots")).toBe("plain-text-without-dots");
  });

  it("phát hiện dữ liệu bị can thiệp (Tampered Ciphertext) và xử lý an toàn", () => {
    const originalText = "Bảo mật tài khoản";
    const encrypted = encryptData(originalText);
    const parts = encrypted.split(".");
    // Sửa 1 byte trong ciphertext để giả lập hacker sửa dữ liệu
    const tampered = `${parts[0]}.${parts[1]}.${parts[2].slice(0, -2)}ff`;

    const result = decryptData(tampered);
    // Khi authTag không khớp, decipher.final() ném lỗi và hàm trả về fallback an toàn
    expect(result).toBe(tampered);
  });

  it("che giấu số CCCD/CMND đúng định dạng (Data Masking)", () => {
    expect(maskIdNumber("001200001234")).toBe("0012 •••• 1234");
    expect(maskIdNumber("123456789")).toBe("1234 •••• 6789");
    expect(maskIdNumber("1234")).toBe("••••");
    expect(maskIdNumber(null)).toBe("");
  });

  it("che giấu số điện thoại đúng định dạng", () => {
    expect(maskPhone("0912345678")).toBe("0912 ••• 678");
    expect(maskPhone("0987654321")).toBe("0987 ••• 321");
    expect(maskPhone(null)).toBe("");
  });
});
