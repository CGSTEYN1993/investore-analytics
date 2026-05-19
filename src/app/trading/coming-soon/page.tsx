'use client';

import Link from 'next/link';
import { Bot, Sparkles, Clock, ArrowRight, Bell } from 'lucide-react';

/**
 * Public-facing "Coming Soon" splash for the Trading Platform.
 *
 * The full /trading product (engine, accounts, signals, charts) is currently
 * admin-only while we finalise compliance, broker integrations, and
 * production hardening. Non-admin authenticated users are routed here by
 * `frontend/src/middleware.ts`.
 */
export default function TradingComingSoonPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-metallic-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="bg-metallic-900/60 border border-metallic-800 rounded-2xl p-10 text-center shadow-2xl shadow-black/30">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-500/15 border border-primary-500/30 mb-6">
            <Bot className="w-10 h-10 text-primary-400" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-4">
            <Clock className="w-3.5 h-3.5" />
            Coming Soon
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-metallic-100 mb-3">
            Automated Trading Platform
          </h1>
          <p className="text-metallic-400 text-base leading-relaxed max-w-xl mx-auto mb-8">
            We&apos;re putting the finishing touches on InvestOre&apos;s automated
            mining-stock trading platform &mdash; rule-based strategies, live
            broker connectivity, real-time signals, and full audit logs. The
            platform will launch once broker integrations and compliance
            requirements are complete.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mb-8 text-left">
            <div className="bg-metallic-800/50 border border-metallic-700/50 rounded-lg p-4">
              <Sparkles className="w-5 h-5 text-primary-400 mb-2" />
              <div className="text-sm font-semibold text-metallic-100 mb-1">Rule-based strategies</div>
              <div className="text-xs text-metallic-400">Signal-driven entries, position sizing, risk limits</div>
            </div>
            <div className="bg-metallic-800/50 border border-metallic-700/50 rounded-lg p-4">
              <Bot className="w-5 h-5 text-primary-400 mb-2" />
              <div className="text-sm font-semibold text-metallic-100 mb-1">Paper &amp; live modes</div>
              <div className="text-xs text-metallic-400">Test strategies risk-free, then go live with one switch</div>
            </div>
            <div className="bg-metallic-800/50 border border-metallic-700/50 rounded-lg p-4">
              <Bell className="w-5 h-5 text-primary-400 mb-2" />
              <div className="text-sm font-semibold text-metallic-100 mb-1">Full audit log</div>
              <div className="text-xs text-metallic-400">Every signal, order, fill and override timestamped</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/analysis/ai-analyst"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Explore the Analysis Platform
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-metallic-800 hover:bg-metallic-700 text-metallic-200 text-sm font-medium rounded-lg border border-metallic-700/50 transition-colors"
            >
              Request Early Access
            </Link>
          </div>

          <p className="mt-8 text-xs text-metallic-500">
            The trading platform is restricted to authorised administrators
            during the closed-beta phase.
          </p>
        </div>
      </div>
    </div>
  );
}
