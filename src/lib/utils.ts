import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with locale-aware separators
 */
export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency value
 */
export function formatCurrency(value: number | null | undefined, currency = 'USD'): string {
  if (value === null || value === undefined) return '—';
  
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format contained metal (oz, tonnes, etc.)
 */
export function formatMetal(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return '—';
  
  if (unit === 'oz' && value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M oz`;
  }
  if (unit === 'oz' && value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K oz`;
  }
  
  return `${formatNumber(value, 0)} ${unit}`;
}

/**
 * Format date string
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format percentage
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get color class for stage
 */
export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    grassroots: 'bg-slate-400',
    exploration: 'bg-blue-400',
    development: 'bg-amber-400',
    construction: 'bg-orange-400',
    production: 'bg-green-500',
    care_maintenance: 'bg-purple-400',
    closure: 'bg-red-400',
  };
  return colors[stage] || 'bg-gray-400';
}

/**
 * Commodity labels
 */
export const COMMODITY_LABELS: Record<string, string> = {
  Au: 'Gold',
  Ag: 'Silver',
  Cu: 'Copper',
  Li: 'Lithium',
  Zn: 'Zinc',
  Ni: 'Nickel',
  Co: 'Cobalt',
  Pt: 'Platinum',
  Pd: 'Palladium',
  U: 'Uranium',
};

/**
 * Get color for commodity
 */
export function getCommodityColor(commodity: string): string {
  const colors: Record<string, string> = {
    Au: '#FFD700',
    Ag: '#C0C0C0',
    Cu: '#B87333',
    Li: '#93C572',
    Zn: '#7D7D7D',
    Ni: '#8B8589',
    Co: '#0047AB',
    Pt: '#E5E4E2',
    Pd: '#CED0DD',
    U: '#39FF14',
  };
  return colors[commodity] || '#6B7280';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
