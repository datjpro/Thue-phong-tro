/** Chuẩn hóa tên đăng nhập từ tên phòng (ví dụ: "Phòng 101" -> "101") */
export function formatTenantUsername(roomName: string): string {
  const clean = roomName
    .toLowerCase()
    .replace(/phòng|phong|p\.|\s/gi, "")
    .trim();
  return clean || roomName.trim();
}

/** Tạo email alias chuẩn cho người thuê theo số phòng (ví dụ: "101" -> "phong101@tro.local") */
export function formatTenantEmail(roomName: string): string {
  const username = formatTenantUsername(roomName);
  return `phong${username.toLowerCase()}@tro.local`;
}
