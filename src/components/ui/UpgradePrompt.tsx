'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  compact?: boolean;
}

/**
 * A reusable upgrade prompt shown to free-tier users when they
 * try to access a premium feature. Can be embedded inline in any page.
 */
export default function UpgradePrompt({ feature, description, compact = false }: UpgradePromptProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-900/20 to-amber-900/10 border border-amber-500/20 rounded-xl">
        <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm text-metallic-200"><strong className="text-amber-400">Pro</strong> — {feature}</span>
        </div>
        <Link href="/pricing" className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg transition-colors whitespace-nowrap">
          Upgrade <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-metallic-900/80 via-amber-900/10 to-metallic-900/80 p-6 text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-amber-500/5 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-amber-500/15 rounded-full">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-metallic-100 mb-2">
          Unlock {feature}
        </h3>
        <p className="text-sm text-metallic-400 mb-5 max-w-md mx-auto">
          {description || `${feature} is available on the Professional plan. Upgrade to access this and all premium features.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-900/30">
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro — $49/mo
          </Link>
          <Link href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-metallic-300 text-sm font-medium rounded-lg border border-metallic-700 hover:border-metallic-500 hover:text-metallic-100 transition-colors">
            Compare Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
