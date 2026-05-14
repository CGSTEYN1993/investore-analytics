'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Database, ExternalLink } from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

interface FactorBlock {
  status: 'ok' | 'limited' | 'missing';
  value?: unknown;
  sources?: string[];
  reason?: string;
}

interface StockBrief {
  ticker: string;
  exchange: string;
  headline_summary?: string;
  market: FactorBlock;
  resources_reserves: FactorBlock;
  economics: FactorBlock;
  engineering_study: FactorBlock;
  production: FactorBlock;
  strip_ratio_metallurgy: FactorBlock;
  water_power_infrastructure: FactorBlock;
  capex_intensity: FactorBlock;
  timeline_to_cashflow: FactorBlock;
  jurisdiction_risk: FactorBlock;
  dilution_risk: FactorBlock;
  esg_permitting: FactorBlock;
  recent_news_signals: FactorBlock;
  geoscience_assets: FactorBlock;
  coverage: {
    ok: number;
    limited: number;
    missing: number;
    total_factors: number;
    fill_rate_pct: number;
  };
}

const FACTOR_LABELS: Record<string, string> = {
  market: 'Market data',
  resources_reserves: 'Resources & reserves',
  economics: 'Economics (NPV / IRR / capex)',
  engineering_study: 'Engineering study',
  production: 'Production',
  strip_ratio_metallurgy: 'Strip ratio & metallurgy',
  water_power_infrastructure: 'Water / power infrastructure',
  capex_intensity: 'Capex intensity',
  timeline_to_cashflow: 'Timeline to cashflow',
  jurisdiction_risk: 'Jurisdiction risk',
  dilution_risk: 'Dilution risk',
  esg_permitting: 'ESG / permitting',
  recent_news_signals: 'Recent news signals',
  geoscience_assets: 'Geoscience footprint',
};

function StatusIcon({ status }: { status: 'ok' | 'limited' | 'missing' }) {
  if (status === 'ok') return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  if (status === 'limited') return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  return <XCircle className="w-4 h-4 text-metallic-600" />;
}

interface Props {
  ticker: string;
  exchange?: string;
  className?: string;
}

export default function StockBriefPanel({ ticker, exchange = 'ASX', className = '' }: Props) {
  const [brief, setBrief] = useState<StockBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${RAILWAY_API_URL}/api/v1/stock-brief/${encodeURIComponent(ticker)}?exchange=${encodeURIComponent(exchange)}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setBrief(data);
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error).message || 'failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (ticker) load();
    return () => { cancelled = true; };
  }, [ticker, exchange]);

  if (loading) {
    return (
      <section className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-2 text-metallic-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading data coverage…
        </div>
      </section>
    );
  }
  if (error || !brief) {
    return (
      <section className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}>
        <div className="text-sm text-metallic-400">Data coverage unavailable ({error || 'no data'}).</div>
      </section>
    );
  }

  const factorEntries = Object.entries(FACTOR_LABELS) as Array<[keyof StockBrief, string]>;
  const okCount = brief.coverage.ok;
  const fillRate = brief.coverage.fill_rate_pct;
  const fillRateColor =
    fillRate >= 60 ? 'text-green-400' : fillRate >= 30 ? 'text-yellow-400' : 'text-red-400';

  return (
    <section className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-400" /> Data Coverage & Stock Brief
          </h2>
          <p className="text-xs text-metallic-500 mt-0.5">
            Multi-factor briefing from your extracted resources, engineering studies, capital raisings,
            geoscience tables and classified news.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-2xl font-bold ${fillRateColor}`}>{fillRate}%</div>
          <div className="text-[10px] uppercase tracking-wide text-metallic-500">
            {okCount}/{brief.coverage.total_factors} factors
          </div>
        </div>
      </div>

      {brief.headline_summary && (
        <div className="mb-4 px-3 py-2 bg-metallic-800/60 border border-metallic-700 rounded-lg text-sm text-metallic-200">
          {brief.headline_summary}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-2">
        {factorEntries.map(([key, label]) => {
          const block = brief[key] as unknown as FactorBlock;
          if (!block) return null;
          return (
            <div
              key={key as string}
              className="flex items-start gap-2 px-3 py-2 bg-metallic-800/40 border border-metallic-800 rounded-lg"
            >
              <StatusIcon status={block.status} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-metallic-200">{label}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wide ${
                      block.status === 'ok'
                        ? 'text-green-400'
                        : block.status === 'limited'
                          ? 'text-yellow-400'
                          : 'text-metallic-500'
                    }`}
                  >
                    {block.status}
                  </span>
                </div>
                {block.sources && block.sources.length > 0 && (
                  <div className="text-[10px] text-metallic-500 mt-0.5 truncate" title={block.sources.join(' · ')}>
                    {block.sources.join(' · ')}
                  </div>
                )}
                {block.status === 'missing' && block.reason && (
                  <div className="text-[10px] text-metallic-600 mt-0.5">why: {block.reason}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-[11px] text-metallic-500 flex items-center gap-1">
        <ExternalLink className="w-3 h-3" />
        Raw JSON:
        <code className="ml-1 px-1.5 py-0.5 bg-metallic-800 rounded text-metallic-400">
          GET /api/v1/stock-brief/{brief.ticker}?exchange={brief.exchange}
        </code>
      </div>
    </section>
  );
}
