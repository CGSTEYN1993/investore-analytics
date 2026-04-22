'use client';
import React from 'react';
import { TIMEFRAMES, Timeframe } from '@/services/tradingService';

interface Props {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
  disabled?: boolean;
}

export default function TimeframeSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="inline-flex rounded-lg bg-metallic-900/60 border border-metallic-700/50 p-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          type="button"
          disabled={disabled}
          onClick={() => onChange(tf)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            value === tf
              ? 'bg-primary-500/20 text-primary-300'
              : 'text-metallic-400 hover:text-metallic-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
