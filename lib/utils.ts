// ============================================================
// SHARED UTILITIES — Hàm tiện ích dùng chung toàn ứng dụng
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely, resolving conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format giá VNĐ dạng triệu/tháng (ví dụ: 3.2 triệu) */
export function formatPriceMillion(price: number): string {
  return (price / 1000000).toFixed(1).replace('.0', '') + ' triệu';
}

/** Format giá VNĐ đầy đủ (ví dụ: 3.200.000 đ) */
export function formatPriceFull(price: number): string {
  return price.toLocaleString('vi-VN') + ' đ';
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
