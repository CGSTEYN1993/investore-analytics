'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Hammer, Layers, FileText, ExternalLink,
  Activity, Loader2, MapPin, Gauge, TrendingUp, DollarSign,
} from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

interface DrillHole {
  id: number;
  hole_id: string;
  drill_type?: string | null;
  target_deposit?: string | null;
  target_zone?: string | null;
  easting?: number | null;
  northing?: number | null;
  elevation?: number | null;
  coordinate_system?: string | null;
  azimuth?: number | null;
  dip?: number | null;
  precollar_depth_m?: number | null;
  total_depth_m?: number | null;
  status?: string | null;
  drill_purpose?: string | null;
  drill_date?: string | null;
  announcement_date?: string | null;
  document_id?: string | null;
  confidence?: number | null;
}

interface Intercept {
  id: number;
  drill_id: number;
  hole_id: string;
  from_m?: number | null;
  to_m?: number | null;
  interval_m?: number | null;
  true_width_m?: number | null;
  commodity?: string | null;
  grade?: number | null;
  grade_unit?: string | null;
  contained_metal?: number | null;
  contained_metal_unit?: string | null;
  announcement_date?: string | null;
}

interface ResourceRow {
  category?: string | null;
  commodity?: string | null;
  tonnage?: number | null;
  tonnage_unit?: string | null;
  grade?: number | null;
  grade_unit?: string | null;
  contained_metal?: number | null;
  contained_unit?: string | null;
  effective_date?: string | null;
  confidence?: number | null;
}

interface ReserveRow extends ResourceRow {}

interface EconomicsRow {
  study_type?: string | null;
  npv_usd?: number | null;
  post_tax_npv_usd?: number | null;
  irr_pct?: number | null;
  capex_usd?: number | null;
  aisc?: number | null;
  aisc_unit?: string | null;
  c1_cost?: number | null;
  payback_years?: number | null;
  confidence?: number | null;
}

interface DocumentRow {
  document_id: string;
  title?: string | null;
  pdf_url?: string | null;
  num_pages?: number | null;
  announcement_date?: string | null;
}

interface Detail {
  symbol: string;
  project_name: string;
  drill_holes: DrillHole[];
  intercepts: Intercept[];
  resources: ResourceRow[];
  reserves: ReserveRow[];
  economics: EconomicsRow[];
  documents: DocumentRow[];
  summary: {
    drill_holes_count: number;
    intercepts_count: number;
    max_grade: number | null;
    mean_grade: number | null;
    resources_count: number;
    reserves_count: number;
    economics_count: number;
    documents_count: number;
    has_collar_coordinates: boolean;
  };
}

function fmtNum(n: number | null | undefined, digits = 2): string {
  if (n == null || isNaN(n)) return '—';
  return n.toFixed(digits);
}
function fmtUsdM(n: number | null | undefined): string {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function StatTile({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wide text-metallic-500">
          {label}
        </span>
        <Icon className="w-4 h-4 text-metallic-600" />
      </div>
      <div className="text-xl font-semibold text-metallic-100">{value}</div>
      {sub && <div className="text-xs text-metallic-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const search = useSearchParams();
  const ticker = decodeURIComponent(String(params?.ticker ?? ''));
  const project = decodeURIComponent(String(params?.project ?? ''));
  const exchange = search?.get('exchange') || '';

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [holeFilter, setHoleFilter] = useState('');
  const [minGrade, setMinGrade] = useState<number | ''>('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const url =
          `${RAILWAY_API_URL}/api/v1/mining/company/${encodeURIComponent(ticker)}` +
          `/projects/${encodeURIComponent(project)}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (!cancelled) setData(j);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load project');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (ticker && project) load();
    return () => {
      cancelled = true;
    };
  }, [ticker, project]);

  const intercepts = useMemo(() => {
    if (!data) return [];
    return data.intercepts.filter((i) => {
      if (
        holeFilter &&
        !i.hole_id?.toLowerCase().includes(holeFilter.toLowerCase())
      )
        return false;
      if (minGrade !== '' && (i.grade == null || i.grade < Number(minGrade)))
        return false;
      return true;
    });
  }, [data, holeFilter, minGrade]);

  const back = `/company/${encodeURIComponent(ticker)}${
    exchange ? `?exchange=${encodeURIComponent(exchange)}` : ''
  }`;

  return (
    <div className="min-h-screen bg-metallic-950 text-metallic-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={back}
          className="inline-flex items-center gap-2 text-sm text-metallic-400 hover:text-metallic-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {ticker}
        </Link>

        <header className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Layers className="w-6 h-6 text-primary-400" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              {data?.project_name || project}
            </h1>
          </div>
          <p className="text-sm text-metallic-500">
            {ticker} · scientific drilldown extracted from announcements &amp;
            JORC tables
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : err ? (
          <p className="text-red-400">{err}</p>
        ) : !data ? null : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile
                label="Drill holes"
                value={data.summary.drill_holes_count}
                icon={Hammer}
              />
              <StatTile
                label="Intercepts"
                value={data.summary.intercepts_count}
                icon={Activity}
              />
              <StatTile
                label="Peak grade"
                value={
                  data.summary.max_grade != null
                    ? `${data.summary.max_grade.toFixed(2)}`
                    : '—'
                }
                sub="best assay"
                icon={Gauge}
              />
              <StatTile
                label="Source PDFs"
                value={data.summary.documents_count}
                sub="announcements parsed"
                icon={FileText}
              />
            </div>

            {/* RESOURCES / RESERVES */}
            {(data.resources.length > 0 || data.reserves.length > 0) && (
              <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary-400" /> Resources
                  &amp; Reserves
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-[10px] uppercase tracking-wide text-metallic-500 border-b border-metallic-800">
                      <tr>
                        <th className="text-left py-2 pr-3">Type</th>
                        <th className="text-left py-2 pr-3">Category</th>
                        <th className="text-left py-2 pr-3">Commodity</th>
                        <th className="text-right py-2 pr-3">Tonnage</th>
                        <th className="text-right py-2 pr-3">Grade</th>
                        <th className="text-right py-2 pr-3">Contained</th>
                        <th className="text-right py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-metallic-800/60">
                      {[
                        ...data.resources.map((r) => ({ kind: 'Resource', r })),
                        ...data.reserves.map((r) => ({ kind: 'Reserve', r })),
                      ].map((row, idx) => (
                        <tr key={idx}>
                          <td className="py-2 pr-3 text-metallic-300">
                            {row.kind}
                          </td>
                          <td className="py-2 pr-3">{row.r.category || '—'}</td>
                          <td className="py-2 pr-3">{row.r.commodity || '—'}</td>
                          <td className="py-2 pr-3 text-right">
                            {fmtNum(row.r.tonnage)} {row.r.tonnage_unit || ''}
                          </td>
                          <td className="py-2 pr-3 text-right">
                            {fmtNum(row.r.grade)} {row.r.grade_unit || ''}
                          </td>
                          <td className="py-2 pr-3 text-right">
                            {row.r.contained_metal != null
                              ? `${fmtNum(row.r.contained_metal)} ${
                                  row.r.contained_unit || ''
                                }`
                              : '—'}
                          </td>
                          <td className="py-2 text-right text-metallic-500">
                            {row.r.effective_date?.split('T')[0] || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ECONOMICS */}
            {data.economics.length > 0 && (
              <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary-400" /> Project
                  Economics
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-[10px] uppercase tracking-wide text-metallic-500 border-b border-metallic-800">
                      <tr>
                        <th className="text-left py-2 pr-3">Study</th>
                        <th className="text-right py-2 pr-3">NPV (pre-tax)</th>
                        <th className="text-right py-2 pr-3">NPV (post-tax)</th>
                        <th className="text-right py-2 pr-3">IRR</th>
                        <th className="text-right py-2 pr-3">CapEx</th>
                        <th className="text-right py-2 pr-3">AISC</th>
                        <th className="text-right py-2">Payback (y)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-metallic-800/60">
                      {data.economics.map((e, idx) => (
                        <tr key={idx}>
                          <td className="py-2 pr-3 text-metallic-300">
                            {e.study_type || '—'}
                          </td>
                          <td className="py-2 pr-3 text-right">
                            {fmtUsdM(e.npv_usd)}
                          </td>
                          <td className="py-2 pr-3 text-right">
                            {fmtUsdM(e.post_tax_npv_usd)}
                          </td>
                          <td className="py-2 pr-3 text-right">
                            {e.irr_pct != null ? `${e.irr_pct.toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-2 pr-3 text-right">
                            {fmtUsdM(e.capex_usd)}
                          </td>
                          <td className="py-2 pr-3 text-right">
                            {e.aisc != null
                              ? `${fmtNum(e.aisc)} ${e.aisc_unit || ''}`
                              : '—'}
                          </td>
                          <td className="py-2 text-right">
                            {fmtNum(e.payback_years, 1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* DRILL HOLES TABLE */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-primary-400" /> Drill Holes
                </h2>
                <span className="text-xs text-metallic-500">
                  {data.drill_holes.length} hole(s)
                  {data.summary.has_collar_coordinates && (
                    <span className="ml-2 inline-flex items-center gap-1 text-emerald-400">
                      <MapPin className="w-3 h-3" /> collar coordinates
                      available
                    </span>
                  )}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-wide text-metallic-500 border-b border-metallic-800">
                    <tr>
                      <th className="text-left py-2 pr-3">Hole ID</th>
                      <th className="text-left py-2 pr-3">Type</th>
                      <th className="text-right py-2 pr-3">Depth (m)</th>
                      <th className="text-right py-2 pr-3">Azimuth</th>
                      <th className="text-right py-2 pr-3">Dip</th>
                      <th className="text-right py-2 pr-3">Easting</th>
                      <th className="text-right py-2 pr-3">Northing</th>
                      <th className="text-left py-2 pr-3">Purpose</th>
                      <th className="text-right py-2">Announced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-metallic-800/60">
                    {data.drill_holes.map((h) => (
                      <tr key={h.id} className="hover:bg-metallic-800/40">
                        <td className="py-2 pr-3 font-mono text-metallic-100">
                          {h.hole_id}
                        </td>
                        <td className="py-2 pr-3 text-metallic-400">
                          {h.drill_type || '—'}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          {fmtNum(h.total_depth_m, 1)}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          {fmtNum(h.azimuth, 0)}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          {fmtNum(h.dip, 0)}
                        </td>
                        <td className="py-2 pr-3 text-right text-metallic-400">
                          {fmtNum(h.easting, 0)}
                        </td>
                        <td className="py-2 pr-3 text-right text-metallic-400">
                          {fmtNum(h.northing, 0)}
                        </td>
                        <td className="py-2 pr-3 text-metallic-400">
                          {h.drill_purpose || '—'}
                        </td>
                        <td className="py-2 text-right text-metallic-500">
                          {h.announcement_date?.split('T')[0] || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* INTERCEPTS TABLE */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Significant
                  Intercepts
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Filter hole ID…"
                    value={holeFilter}
                    onChange={(e) => setHoleFilter(e.target.value)}
                    className="bg-metallic-800 border border-metallic-700 rounded px-2 py-1 text-metallic-100 placeholder-metallic-500"
                  />
                  <input
                    type="number"
                    placeholder="Min grade"
                    value={minGrade}
                    onChange={(e) =>
                      setMinGrade(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="bg-metallic-800 border border-metallic-700 rounded px-2 py-1 w-24 text-metallic-100 placeholder-metallic-500"
                  />
                  <span className="text-metallic-500">
                    {intercepts.length} shown
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-wide text-metallic-500 border-b border-metallic-800">
                    <tr>
                      <th className="text-left py-2 pr-3">Hole</th>
                      <th className="text-right py-2 pr-3">From</th>
                      <th className="text-right py-2 pr-3">To</th>
                      <th className="text-right py-2 pr-3">Interval</th>
                      <th className="text-right py-2 pr-3">True width</th>
                      <th className="text-left py-2 pr-3">Comm.</th>
                      <th className="text-right py-2 pr-3">Grade</th>
                      <th className="text-right py-2">Announced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-metallic-800/60">
                    {intercepts.map((i) => (
                      <tr key={i.id} className="hover:bg-metallic-800/40">
                        <td className="py-2 pr-3 font-mono">{i.hole_id}</td>
                        <td className="py-2 pr-3 text-right">
                          {fmtNum(i.from_m, 1)}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          {fmtNum(i.to_m, 1)}
                        </td>
                        <td className="py-2 pr-3 text-right text-metallic-200">
                          {fmtNum(i.interval_m, 1)} m
                        </td>
                        <td className="py-2 pr-3 text-right text-metallic-400">
                          {fmtNum(i.true_width_m, 1)}
                        </td>
                        <td className="py-2 pr-3">{i.commodity || '—'}</td>
                        <td className="py-2 pr-3 text-right text-emerald-300 font-semibold">
                          {i.grade != null
                            ? `${i.grade.toFixed(2)} ${i.grade_unit || ''}`
                            : '—'}
                        </td>
                        <td className="py-2 text-right text-metallic-500">
                          {i.announcement_date?.split('T')[0] || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SOURCE DOCUMENTS */}
            {data.documents.length > 0 && (
              <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-400" /> Source
                  Announcements
                </h2>
                <ul className="space-y-2">
                  {data.documents.map((d) => (
                    <li
                      key={d.document_id}
                      className="flex items-center justify-between gap-3 text-sm bg-metallic-800/40 rounded px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-metallic-100">
                          {d.title || d.document_id}
                        </div>
                        <div className="text-xs text-metallic-500">
                          {d.announcement_date?.split('T')[0] || ''} ·{' '}
                          {d.num_pages || '?'} pp
                        </div>
                      </div>
                      {d.pdf_url && (
                        <a
                          href={d.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary-300 hover:text-primary-200"
                        >
                          PDF <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="text-[10px] text-metallic-600">
              Roadmap: drill-hole collar map, tenement polygons, cross-section
              image extraction, and 3D orebody view are queued for Phase 2 once
              spatial geometry coverage is sufficient.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
