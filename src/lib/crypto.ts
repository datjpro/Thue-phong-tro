import crypto from "node:crypto";
import { env } from "./env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Khuyến nghị chuẩn cho GCM
const AUTH_TAG_LENGTH = 16;

/** Lấy key 32-byte từ chuỗi secret cấu hình */
function getEncryptionKey(): Buffer {
  const secret = env.ENCRYPTION_KEY || env.BETTER_AUTH_SECRET;
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Mã hóa chuỗi nhạy cảm bằng AES-256-GCM (Data Encryption at Rest).
 * Định dạng xuất ra: `iv.authTag.cipherText` (Hex).
 */
export function encryptData(plainText: string): string {
  if (!plainText) return plainText;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}.${authTag}.${encrypted}`;
}

/**
 * Giải mã chuỗi đã mã hóa bằng AES-256-GCM.
 * Nếu chuỗi bị chỉnh sửa (tampered) hoặc khóa sai, sẽ trả về fallback an toàn hoặc ném lỗi.
 */
export function decryptData(cipherText: string): string {
  if (!cipherText?.includes(".")) return cipherText;
  try {
    const parts = cipherText.split(".");
    if (parts.length !== 3) return cipherText;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    // Trả về chuỗi nguyên bản nếu không thể giải mã (ví dụ dữ liệu cũ chưa mã hóa)
    return cipherText;
  }
}

/**
 * Che giấu thông tin nhạy cảm như CCCD/CMND khi hiển thị trên giao diện (Data Masking).
 * Ví dụ: "001200001234" -> "0012 •••• 1234"
 */
export function maskIdNumber(idNumber: string | null | undefined): string {
  if (!idNumber) return "";
  const cleaned = idNumber.trim();
  if (cleaned.length <= 4) return "••••";
  if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 2)}••••${cleaned.slice(-2)}`;
  }
  const start = cleaned.slice(0, 4);
  const end = cleaned.slice(-4);
  return `${start} •••• ${end}`;
}

/**
 * Che giấu số điện thoại.
 * Ví dụ: "0912345678" -> "0912 ••• 678"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return "••••";
  const start = cleaned.slice(0, 4);
  const end = cleaned.slice(-3);
  return `${start} ••• ${end}`;
}
