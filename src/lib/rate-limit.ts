interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Dọn dẹp các bản ghi hết hạn định kỳ mỗi 5 phút
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of rateLimitMap.entries()) {
        if (record.resetAt <= now) {
          rateLimitMap.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );
}

export interface RateLimitOptions {
  limit?: number; // Số lượng request tối đa trong cửa sổ
  windowMs?: number; // Cửa sổ thời gian tính bằng mili-giây
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Kiểm tra giới hạn tần suất request (Rate Limiting).
 * Ngăn chặn brute-force và lặp request từ F12 Console hoặc tool tự động.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const limit = options.limit ?? 30; // Mặc định 30 lần
  const windowMs = options.windowMs ?? 60 * 1000; // Mặc định trong 1 phút
  const now = Date.now();

  const record = rateLimitMap.get(identifier);

  if (!record || record.resetAt <= now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    reset: record.resetAt,
  };
}
