'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, BarChart3 } from 'lucide-react';

/**
 * Top-level platform switcher that appears in the global header.
 * Lets users flip between the Analysis platform and the Trading platform.
 *
 * "Trading" includes anything under /trading.
 * Everything else (dashboard, map, analysis, news, etc.) is "Analysis".
 */
export function PlatformSwitcher() {
  const pathname = usePathname() || '/';
  const isTrading = pathname.startsWith('/trading');

  return (
    <div className="hidden sm:flex items-center bg-metallic-900/80 border border-metallic-700/60 rounded-lg p-0.5">
      <Link
        href="/dashboard"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          !isTrading
            ? 'bg-metallic-700/80 text-primary-300 shadow-sm'
            : 'text-metallic-400 hover:text-metallic-200'
        }`}
      >
        <BarChart3 className="w-3.5 h-3.5" />
        Analysis
      </Link>
      <Link
        href="/trading"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          isTrading
            ? 'bg-gradient-to-r from-primary-600/30 to-primary-500/30 text-primary-200 shadow-sm border border-primary-500/40'
            : 'text-metallic-400 hover:text-metallic-200'
        }`}
      >
        <Bot className="w-3.5 h-3.5" />
        Trading
      </Link>
    </div>
  );
}
