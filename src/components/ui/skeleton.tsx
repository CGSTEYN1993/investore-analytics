'use client';

import * as React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-metallic-700/50 rounded ${className}`}
      {...props}
    />
  );
}

/**
 * Card-shaped skeleton matching the dashboard stat-card footprint.
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-metallic-900 border border-metallic-800 rounded-xl p-5 ${className}`}
    >
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/**
 * Table-shaped skeleton with header + N rows × M columns.
 */
export function SkeletonTable({
  rows = 6,
  columns = 5,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden ${className}`}
    >
      <div className="px-5 py-3 border-b border-metallic-800 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-metallic-800/60">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-5 py-3 flex gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-3.5 ${c === 0 ? 'w-1/4' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Vertical list of N simple row skeletons (no table header chrome).
 */
export function SkeletonList({
  rows = 5,
  className = '',
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-metallic-900/60 border border-metallic-800 rounded-lg p-4"
        >
          <Skeleton className="h-3 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
