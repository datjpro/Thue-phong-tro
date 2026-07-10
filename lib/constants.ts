// ============================================================
// SHARED CONSTANTS — Nguồn sự thật duy nhất cho toàn bộ ứng dụng
// ============================================================

export const amenitiesList = [
  { id: 'wifi', name: 'Wifi tốc độ cao' },
  { id: 'dieu-hoa', name: 'Máy lạnh/Điều hòa' },
  { id: 'gac-lung', name: 'Gác lửng' },
  { id: 'xe-may', name: 'Chỗ để xe máy' },
  { id: 'gio-tu-do', name: 'Giờ giấc tự do' },
  { id: 'bep', name: 'Bếp nấu ăn' },
  { id: 'may-giat', name: 'Máy giặt' },
  { id: 'tu-lanh', name: 'Tủ lạnh' },
  { id: 'tu-quan-ao', name: 'Tủ quần áo' },
  { id: 'ban-cong', name: 'Ban công thoáng' },
  { id: 'bao-ve', name: 'Bảo vệ an ninh' },
] as const;

export const roomTypeNames: Record<string, string> = {
  'phong-tro': 'Phòng trọ',
  'chung-cu-mini': 'Chung cư mini',
  'o-ghep': 'Ở ghép / KTX',
};

export const statusNames: Record<string, string> = {
  available: 'Còn trống',
  reserved: 'Giữ chỗ',
  rented: 'Đã thuê',
};

export const statusVariants: Record<string, 'success' | 'warning' | 'danger'> = {
  available: 'success',
  reserved: 'warning',
  rented: 'danger',
};

export const billStatusLabels: Record<string, string> = {
  paid: 'Đã đóng',
  pending: 'Đang duyệt',
  unpaid: 'Chưa đóng',
};

export const issueStatusLabels: Record<string, string> = {
  resolved: 'Đã sửa xong',
  processing: 'Đang xử lý',
  pending: 'Chờ duyệt',
};

export const issueCategoryLabels: Record<string, string> = {
  'dien-nuoc': 'Điện nước',
  'thiet-bi': 'Thiết bị gia dụng',
  internet: 'Mạng wifi',
  khac: 'Khác',
};
