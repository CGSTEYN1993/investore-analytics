'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, ExternalLink, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface SubscriptionStatus {
  status: string;
  tier: string;
  subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  features?: Record<string, unknown>;
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

export default function BillingSettingsPage() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<SubscriptionStatus>('/subscription/status');
        if (!cancelled) setStatus(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load subscription status.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tier = status?.tier ?? user?.subscription_tier ?? 'free';
  const isPro = tier !== 'free';

  const openBillingPortal = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const response = await api.post<{ portal_url: string }>('/subscription/billing-portal', {
        return_url: typeof window !== 'undefined' ? `${window.location.origin}/settings/billing` : undefined,
      });
      window.location.href = response.portal_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open the billing portal.');
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-metallic-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-metallic-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="mt-2 text-metallic-400">
            Manage your InvestOre plan, payment methods, and invoices.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-metallic-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading subscription…
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <section className="rounded-xl border border-metallic-800 bg-metallic-900/50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-metallic-500">
                    Current plan
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">
                      {isPro ? 'InvestOre Pro' : 'Free'}
                    </h2>
                    {isPro && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-gold/15 px-2.5 py-0.5 text-xs font-medium text-accent-gold">
                        <Check className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>
                  {status?.status && (
                    <p className="mt-1 text-sm text-metallic-400">
                      Status: <span className="text-white">{status.status}</span>
                    </p>
                  )}
                </div>

                {isPro ? (
                  <button
                    type="button"
                    onClick={openBillingPortal}
                    disabled={portalLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-gold px-5 py-2.5 text-sm font-semibold text-metallic-950 transition-colors hover:bg-accent-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {portalLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Manage Subscription
                    {!portalLoading && <ExternalLink className="h-3.5 w-3.5" />}
                  </button>
                ) : (
                  <Link
                    href="/pricing?returnUrl=/settings/billing"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-gold px-5 py-2.5 text-sm font-semibold text-metallic-950 transition-colors hover:bg-accent-gold/90"
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </div>

              {isPro && (
                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-metallic-800 pt-6 sm:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-metallic-500">
                      Current period
                    </div>
                    <div className="mt-1 text-sm text-white">
                      {formatDate(status?.current_period_start)} → {formatDate(status?.current_period_end)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-metallic-500">
                      Renewal
                    </div>
                    <div className="mt-1 text-sm text-white">
                      {status?.cancel_at_period_end
                        ? `Cancels on ${formatDate(status?.current_period_end)}`
                        : `Renews on ${formatDate(status?.current_period_end)}`}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-metallic-800 bg-metallic-900/30 p-6">
              <h3 className="text-lg font-semibold">What you get with Pro</h3>
              <ul className="mt-4 space-y-2 text-sm text-metallic-300">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-accent-gold" />
                  Unlimited AI Research Analyst queries
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-accent-gold" />
                  Full company tables, peer comparison and CSV export
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-accent-gold" />
                  Sentiment, signals, and commodity breakdown charts
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-accent-gold" />
                  Early access to the upcoming Trading Platform
                </li>
              </ul>
            </section>

            <p className="text-xs text-metallic-500">
              Payments are processed securely by Stripe. The billing portal lets you update your
              card, download invoices, change billing intervals, or cancel your subscription.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
