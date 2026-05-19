'use client';

import Link from 'next/link';
import { Sparkles, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

/**
 * Convenience hook for components that need to branch on whether the
 * current user is on the free tier (so they can render a paywall).
 *
 * Admins are never considered "free" — internal operators always see
 * the full product even if their billing record says otherwise.
 */
export function useIsFreeTier(): boolean {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return true;
  if (user?.role === 'admin') return false;
  return (user?.subscription_tier ?? 'free') === 'free';
}

interface UpgradePromptProps {
  /** Short title displayed at the top of the prompt. */
  title?: string;
  /** Longer explanation of what the user unlocks by upgrading. */
  message?: string;
  /** Optional return URL appended to the /pricing link so users land back here after subscribing. */
  returnUrl?: string;
  /** Render compact (inline) or full-bleed (card) styling. */
  variant?: 'card' | 'inline';
  /** Optional override for the primary CTA label. */
  ctaLabel?: string;
}

/**
 * Reusable paywall prompt shown wherever a Pro-only feature is hidden
 * for free-tier users. Routes the user to /pricing with a returnUrl so
 * they can resume their flow after subscribing.
 */
export function UpgradePrompt({
  title = 'Upgrade to InvestOre Pro',
  message = 'This feature is available to Pro subscribers. Upgrade for unlimited access across the analysis platform.',
  returnUrl,
  variant = 'card',
  ctaLabel = 'See Pro plans',
}: UpgradePromptProps) {
  const pricingHref = returnUrl
    ? `/pricing?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/pricing';

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-primary-500/10 border border-primary-500/30">
        <div className="flex items-center gap-2 text-sm text-primary-200">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
        <Link
          href={pricingHref}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-md transition-colors"
        >
          {ctaLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary-500/30 bg-gradient-to-br from-primary-500/10 via-metallic-900/60 to-metallic-900/80 p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-500/20 border border-primary-500/30 mb-4">
        <Sparkles className="w-7 h-7 text-primary-300" />
      </div>
      <h3 className="text-xl font-bold text-metallic-50 mb-2">{title}</h3>
      <p className="text-metallic-300 text-sm max-w-md mx-auto mb-6">{message}</p>
      <Link
        href={pricingHref}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-primary-500/25"
      >
        {ctaLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
