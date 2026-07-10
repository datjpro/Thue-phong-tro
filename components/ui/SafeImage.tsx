'use client';

import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

/**
 * SafeImage — Wrapper cho <img> với fallback gradient khi ảnh lỗi.
 * Tự động hiển thị placeholder đẹp nếu URL ảnh bị hỏng hoặc offline.
 */
export default function SafeImage({
  src,
  alt,
  className,
  fallbackText,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-muted/20 ${className ?? ''}`}
        style={{ aspectRatio: props.style?.aspectRatio }}
      >
        <div className="flex flex-col items-center gap-1.5 text-center px-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">
            {fallbackText || 'Ảnh không khả dụng'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
