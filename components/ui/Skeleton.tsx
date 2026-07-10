'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'pulse' | 'shimmer';
}

/** Animated skeleton placeholder for loading states */
export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'shimmer',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-muted/40 relative overflow-hidden',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-xl',
        variant === 'text' && 'rounded-md h-3.5 w-3/4',
        animation === 'pulse' && 'animate-pulse',
        animation === 'shimmer' && 'skeleton-shimmer',
        className
      )}
    />
  );
}

/** Skeleton card mimicking RoomCard layout */
export function RoomCardSkeleton() {
  return (
    <div className="flex flex-col w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Image placeholder */}
      <Skeleton className="aspect-[4/3] w-full rounded-none rounded-t-2xl" />

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <Skeleton variant="text" className="h-4 w-5/6" />
        <Skeleton variant="text" className="h-3 w-2/3" />

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-3">
            <Skeleton variant="text" className="h-3 w-14" />
            <Skeleton variant="text" className="h-3 w-16" />
          </div>
          <Skeleton variant="text" className="h-3 w-10" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col gap-1">
            <Skeleton variant="text" className="h-2.5 w-12" />
            <Skeleton variant="text" className="h-5 w-20" />
          </div>
          <Skeleton variant="text" className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

/** Grid of skeleton cards */
export function RoomCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6.5">
      {Array.from({ length: count }).map((_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton table rows */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="border-b border-border/30">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="p-4">
              <Skeleton variant="text" className="h-3.5 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
