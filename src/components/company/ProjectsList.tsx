'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2, Layers, ChevronRight, Hammer, Activity,
  MapPin, Database,
} from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

interface BestIntercept {
  hole_id?: string | null;
  from_m?: number | null;
  to_m?: number | null;
  interval_m?: number | null;
  grade?: number | null;
  grade_unit?: string | null;
  commodity?: string | null;
  announcement_date?: string | null;
}

interface ProjectRow {
  project_name: string;
  slug: string;
  stages: string[];
  stage: string | null;
  commodities: string[];
  jurisdictions: string[];
  sources: string[];
  drill_results_count: number;
  drill_holes_count: number;
  intercepts_count: number;
  max_hole_depth_m: number | null;
  best_intercept: BestIntercept | null;
  last_seen: string | null;
  first_seen: string | null;
  ownership_pct: number | null;
}

interface Props {
  ticker: string;
  exchange?: string;
  className?: string;
}

function fmtGrade(b: BestIntercept | null): string {
  if (!b || b.grade == null) return '—';
  const interval =
    b.interval_m != null
      ? `${b.interval_m.toFixed(1)} m`
      : b.from_m != null && b.to_m != null
      ? `${(b.to_m - b.from_m).toFixed(1)} m`
      : '';
  return `${interval} @ ${b.grade.toFixed(2)} ${b.grade_unit || ''}${
    b.commodity ? ` ${b.commodity}` : ''
  }`.trim();
}

export default function ProjectsList({ ticker, exchange, className = '' }: Props) {
  const [data, setData] = useState<{ total: number; projects: ProjectRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(
          `${RAILWAY_API_URL}/api/v1/mining/company/${encodeURIComponent(ticker)}/projects`,
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (!cancelled) setData({ total: j.total, projects: j.projects || [] });
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (ticker) load();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return (
    <section
      className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary-400" />
          Projects Portfolio
        </h2>
        {data && (
          <span className="text-xs text-metallic-500">
            {data.total} project{data.total === 1 ? '' : 's'} extracted from announcements
            &amp; reserve disclosures
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : err ? (
        <p className="text-sm text-red-400">{err}</p>
      ) : !data || data.projects.length === 0 ? (
        <p className="text-sm text-metallic-500">
          No projects yet extracted for {ticker}. Coverage grows as new
          announcements are processed.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.projects.map((p) => {
            const href = `/company/${encodeURIComponent(ticker)}/projects/${encodeURIComponent(
              p.project_name,
            )}${exchange ? `?exchange=${encodeURIComponent(exchange)}` : ''}`;
            return (
              <li key={p.slug}>
                <Link
                  href={href}
                  className="group block bg-metallic-800/40 hover:bg-metallic-800/70 border border-metallic-800 hover:border-primary-700 rounded-lg p-4 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-metallic-100 truncate">
                          {p.project_name}
                        </span>
                        {p.stage && (
                          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-700/40">
                            {p.stage}
                          </span>
                        )}
                        {p.ownership_pct != null && (
                          <span className="text-[10px] text-metallic-400 px-2 py-0.5 rounded-full border border-metallic-700">
                            {p.ownership_pct}% owned
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-metallic-400 flex-wrap">
                        {p.commodities.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {p.commodities.join(', ')}
                          </span>
                        )}
                        {p.jurisdictions.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {p.jurisdictions.join(', ')}
                          </span>
                        )}
                        {p.last_seen && (
                          <span>Last update {p.last_seen.split('T')[0]}</span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="bg-metallic-900/60 rounded px-2 py-1">
                          <div className="text-metallic-500">Holes</div>
                          <div className="text-metallic-100 font-semibold">
                            {p.drill_holes_count}
                          </div>
                        </div>
                        <div className="bg-metallic-900/60 rounded px-2 py-1">
                          <div className="text-metallic-500">Intercepts</div>
                          <div className="text-metallic-100 font-semibold">
                            {p.intercepts_count}
                          </div>
                        </div>
                        <div className="bg-metallic-900/60 rounded px-2 py-1">
                          <div className="text-metallic-500">Max depth</div>
                          <div className="text-metallic-100 font-semibold">
                            {p.max_hole_depth_m != null
                              ? `${p.max_hole_depth_m.toFixed(0)} m`
                              : '—'}
                          </div>
                        </div>
                        <div className="bg-metallic-900/60 rounded px-2 py-1">
                          <div className="text-metallic-500">Best hit</div>
                          <div className="text-emerald-300 font-semibold truncate">
                            {fmtGrade(p.best_intercept)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-metallic-500 group-hover:text-primary-300 flex-shrink-0 mt-1" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-[10px] text-metallic-600 flex items-center gap-1">
        <Activity className="w-3 h-3" />
        Aggregated from extracted JORC tables, DMIRS-style disclosures, and
        MineralMetrics project records.
      </p>
    </section>
  );
}
