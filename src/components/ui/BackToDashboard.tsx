'use client';

import Link from 'next/link';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

interface BackToDashboardProps {
  className?: string;
}

export default function BackToDashboard({ className = '' }: BackToDashboardProps) {
  return (
    <Link
      href="/analysis"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-metallic-800 hover:bg-metallic-700 border border-metallic-600 rounded-lg text-metallic-200 hover:text-metallic-100 transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back to Dashboard</span>
    </Link>
  );
}

// Compact version for tight spaces
export function BackToDashboardCompact({ className = '' }: BackToDashboardProps) {
  return (
    <Link
      href="/analysis"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors ${className}`}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>Dashboard</span>
    </Link>
  );
}
