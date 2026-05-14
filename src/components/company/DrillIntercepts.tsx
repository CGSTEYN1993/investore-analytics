'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Hammer, FileText } from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

interface DrillIntercept {
  id: number;
  hole_id?: string;
  from_m?: number;
  to_m?: number;
  width_m?: number;
  grade?: number;
  grade_unit?: string;
  commodity?: string;
  including?: { from?: number; to?: number; grade?: number } | null;
  project_name?: string;
  source_document?: string;
  extraction_confidence?: number;
  extracted_at?: string;
  headline?: string;
}

interface DrillResponse {
  symbol: string;
  total: number;
  intercepts: DrillIntercept[];
}

interface Props {
  ticker: string;
  className?: string;
  daysBack?: number;
}

function formatGrade(g?: number, unit?: string): string {
  if (g === undefined || g === null) return '—';
  return `${g.toFixed(2)} ${unit || ''}`.trim();
}

function formatInterval(from?: number, to?: number, width?: number): string {
  if (width !== undefined && width !== null) return `${width.toFixed(1)} m`;
  if (from !== undefined && to !== undefined) return `${(to - from).toFixed(1)} m`;
  return '—';
}

export default function DrillIntercepts({ ticker, className = '', daysBack = 1825 }: Props) {
  const [data, setData] = useState<DrillResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `${RAILWAY_API_URL}/api/v1/geological/drilling/company/${encodeURIComponent(ticker)}?days_back=${daysBack}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setData({ symbol: ticker, total: 0, intercepts: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (ticker) load();
    return () => { cancelled = true; };
  }, [ticker, daysBack]);

  return (
    <section className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
          <Hammer className="w-5 h-5 text-primary-400" /> Drill Intercepts
        </h2>
        {data && (
          <span className="text-xs text-metallic-500">
            {data.total} intercept(s) · last {Math.round(daysBack / 365)}y
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-metallic-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading drill results…
        </div>
      ) : !data || data.intercepts.length === 0 ? (
        <div className="text-sm text-metallic-400">
          No extracted drill intercepts on file for <span className="font-mono text-metallic-300">{ticker}</span>.
          <div className="text-xs text-metallic-500 mt-1">
            This usually means the announcement extractor (<code className="text-metallic-400">extracted_drill_intercepts</code>)
            hasn&apos;t processed this company&apos;s recent drilling reports yet, or there are no
            published drill results in the last {Math.round(daysBack / 365)} years.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-metallic-500 uppercase tracking-wide">
              <tr className="border-b border-metallic-800">
                <th className="text-left py-2 pr-3">Hole</th>
                <th className="text-left py-2 pr-3">Project</th>
                <th className="text-right py-2 pr-3">From-To (m)</th>
                <th className="text-right py-2 pr-3">Width</th>
                <th className="text-right py-2 pr-3">Grade</th>
                <th className="text-left py-2 pr-3">Cmd.</th>
                <th className="text-left py-2 pr-3">Significant</th>
                <th className="text-left py-2">Project / Source</th>
              </tr>
            </thead>
            <tbody className="text-metallic-200">
              {data.intercepts.slice(0, 25).map((i) => (
                <tr key={i.id} className="border-b border-metallic-800/60 hover:bg-metallic-800/30">
                  <td className="py-2 pr-3 font-mono text-primary-400">{i.hole_id || '—'}</td>
                  <td className="py-2 pr-3 truncate max-w-[180px]" title={i.project_name}>
                    {i.project_name || '—'}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {i.from_m !== undefined && i.to_m !== undefined
                      ? `${i.from_m.toFixed(1)}–${i.to_m.toFixed(1)}`
                      : '—'}
                  </td>
                  <td className="py-2 pr-3 text-right">{formatInterval(i.from_m, i.to_m, i.width_m)}</td>
                  <td className="py-2 pr-3 text-right font-semibold text-green-400">
                    {formatGrade(i.grade, i.grade_unit)}
                  </td>
                  <td className="py-2 pr-3 text-metallic-300">{i.commodity || '—'}</td>
                  <td className="py-2 pr-3">
                    {(i as any).is_high_grade ? (
                      <span className="text-yellow-400">high-grade</span>
                    ) : (i as any).is_significant ? (
                      <span className="text-blue-400">significant</span>
                    ) : (
                      <span className="text-metallic-500">—</span>
                    )}
                  </td>
                  <td className="py-2 text-metallic-500 truncate max-w-[180px]" title={i.source_document}>
                    {i.source_document ? (
                      <a
                        href={i.source_document}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-primary-400"
                      >
                        <FileText className="w-3 h-3" /> source
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.intercepts.length > 25 && (
            <div className="text-xs text-metallic-500 mt-2">
              Showing 25 of {data.intercepts.length}. Best intercepts surfaced first.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
