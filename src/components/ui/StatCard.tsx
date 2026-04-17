'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  /** Short uppercase label shown above the value. */
  label: string;
  /** Primary displayed value (pre-formatted). */
  value: string | number;
  /** Optional secondary text rendered below the value. */
  subValue?: string;
  /** Optional icon rendered in the top-right badge. */
  icon?: React.ReactNode;
  /** Optional delta string shown with up/down arrow. */
  change?: string;
  /** Whether `change` represents a positive move (drives colour). */
  positive?: boolean;
  /** When provided, the card becomes a button. */
  onClick?: () => void;
  /** Additional wrapper classes. */
  className?: string;
  /** Visual density. 'compact' shrinks padding for dense dashboards. */
  density?: 'default' | 'compact';
}

/**
 * Shared statistic tile used across dashboards.
 * Matches the dark metallic theme. Safe-fallbacks for missing props.
 */
export default function StatCard({
  label,
  value,
  subValue,
  icon,
  change,
  positive,
  onClick,
  className = '',
  density = 'default',
}: StatCardProps) {
  const pad = density === 'compact' ? 'p-4' : 'p-5';
  const valueSize = density === 'compact' ? 'text-xl' : 'text-2xl';
  const Tag: 'button' | 'div' = onClick ? 'button' : 'div';
  const interactive = onClick
    ? 'hover:border-metallic-600 hover:bg-metallic-800/80 cursor-pointer text-left w-full'
    : '';

  return (
    <Tag
      onClick={onClick}
      className={`bg-metallic-900/80 backdrop-blur-sm border border-metallic-700/50 rounded-xl ${pad} transition-colors ${interactive} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-metallic-500 truncate">
            {label}
          </p>
          <p className={`${valueSize} font-bold text-metallic-100 mt-1 truncate`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div
              className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                positive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}
            </div>
          )}
          {subValue && !change && (
            <p className="mt-1 text-xs text-metallic-500 truncate">{subValue}</p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-metallic-800/80 shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Tag>
  );
}
