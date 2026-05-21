'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Hammer, Loader2, Activity, ExternalLink, FileText,
} from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';
import DownholeStripLog from '@/components/company/DownholeStripLog';

interface Intercept {
  id: number;
  hole_id: string;
  from_m?: number | null;
  to_m?: number | null;
  interval_m?: number | null;
  true_width_m?: number | null;
  commodity?: string | null;
  grade?: number | null;
  grade_unit?: string | null;
}

interface HoleDetail {
  id: number;
  symbol: string;
  hole_id: string;
  drill_type?: string | null;
  project_name?: string | null;
  target_zone?: string | null;
  drill_purpose?: string | null;
  easting?: number | null;
  northing?: number | null;
  elevation?: number | null;
  coordinate_system?: string | null;
  azimuth?: number | null;
  dip?: number | null;
  precollar_depth_m?: number | null;
  total_depth?: number | null;
  status?: string | null;
  drill_date?: string | null;
  announcement_date?: string | null;
  confidence?: number | null;
  document?: {
    document_id: string;
    title?: string | null;
    pdf_url?: string | null;
    num_pages?: number | null;
  } | null;
  intercepts: Intercept[];
}

function n(v: number | null | undefined, d = 2): string {
  return v == null ? '—' : v.toFixed(d);
}

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wide text-metallic-500">
        {label}
      </div>
      <div className="text-xl font-semibold text-metallic-100">{value}</div>
      {sub && <div className="text-xs text-metallic-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function HoleDetailPage() {
  const params = useParams();
  const search = useSearchParams();
  const ticker = decodeURIComponent(String(params?.ticker ?? ''));
  const project = decodeURIComponent(String(params?.project ?? ''));
  const holeIdStr = String(params?.holeId ?? '');
  const exchange = search?.get('exchange') || '';

  const [data, setData] = useState<HoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(
          `${RAILWAY_API_URL}/api/v1/mining/exploration/drilling/${encodeURIComponent(holeIdStr)}`,
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (!cancelled) setData(j);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load hole');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (holeIdStr) load();
    return () => {
      cancelled = true;
    };
  }, [holeIdStr]);

  const back = `/company/${encodeURIComponent(ticker)}/projects/${encodeURIComponent(
    project,
  )}${exchange ? `?exchange=${encodeURIComponent(exchange)}` : ''}`;

  const peakGrade = useMemo(() => {
    if (!data) return null;
    const gs = data.intercepts
      .map((i) => i.grade)
      .filter((g): g is number => g != null);
    return gs.length ? Math.max(...gs) : null;
  }, [data]);

  return (
    <div className="min-h-screen bg-metallic-950 text-metallic-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={back}
          className="inline-flex items-center gap-2 text-sm text-metallic-400 hover:text-metallic-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {project}
        </Link>

        <header className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Hammer className="w-6 h-6 text-primary-400" />
            <h1 className="text-2xl sm:text-3xl font-bold font-mono">
              {data?.hole_id || holeIdStr}
            </h1>
            {data?.drill_type && (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-700/40">
                {data.drill_type}
              </span>
            )}
          </div>
          <p className="text-sm text-metallic-500">
            {ticker} · {project}
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
              <Tile
                label="Total depth"
                value={`${n(data.total_depth, 1)} m`}
                sub={
                  data.precollar_depth_m != null
                    ? `pre-collar ${n(data.precollar_depth_m, 1)} m`
                    : undefined
                }
              />
              <Tile
                label="Orientation"
                value={`${n(data.azimuth, 0)}° / ${n(data.dip, 0)}°`}
                sub="azimuth / dip"
              />
              <Tile
                label="Intercepts"
                value={data.intercepts.length}
                sub="assayed intervals"
              />
              <Tile
                label="Peak grade"
                value={peakGrade != null ? peakGrade.toFixed(2) : '—'}
                sub="best assay"
              />
            </div>

            {/* COLLAR METADATA */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-3">Collar Metadata</h2>
              <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-[10px] uppercase text-metallic-500">Easting</dt>
                  <dd className="font-mono">{n(data.easting, 1)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-metallic-500">Northing</dt>
                  <dd className="font-mono">{n(data.northing, 1)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-metallic-500">Elevation</dt>
                  <dd className="font-mono">{n(data.elevation, 1)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-metallic-500">Coord. system</dt>
                  <dd>{data.coordinate_system || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-metallic-500">Purpose</dt>
                  <dd>{data.drill_purpose || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-metallic-500">Status</dt>
                  <dd>{data.status || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-metallic-500">Drill date</dt>
                  <dd>{data.drill_date?.split('T')[0] || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-metallic-500">Announced</dt>
                  <dd>{data.announcement_date?.split('T')[0] || '—'}</dd>
                </div>
              </dl>
            </section>

            {/* STRIP LOG for this single hole */}
            <DownholeStripLog
              holes={[
                {
                  hole_id: data.hole_id,
                  total_depth_m: data.total_depth ?? null,
                },
              ]}
              intercepts={data.intercepts.map((i) => ({
                hole_id: data.hole_id,
                from_m: i.from_m,
                to_m: i.to_m,
                interval_m: i.interval_m,
                grade: i.grade,
                grade_unit: i.grade_unit,
                commodity: i.commodity,
              }))}
            />

            {/* INTERCEPTS TABLE */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Assay Intervals
              </h2>
              {data.intercepts.length === 0 ? (
                <p className="text-sm text-metallic-500">
                  No intercepts captured for this hole yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-[10px] uppercase tracking-wide text-metallic-500 border-b border-metallic-800">
                      <tr>
                        <th className="text-right py-2 pr-3">From</th>
                        <th className="text-right py-2 pr-3">To</th>
                        <th className="text-right py-2 pr-3">Interval</th>
                        <th className="text-right py-2 pr-3">True width</th>
                        <th className="text-left py-2 pr-3">Commodity</th>
                        <th className="text-right py-2">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-metallic-800/60">
                      {data.intercepts.map((i) => (
                        <tr key={i.id} className="hover:bg-metallic-800/40">
                          <td className="py-2 pr-3 text-right">{n(i.from_m, 1)}</td>
                          <td className="py-2 pr-3 text-right">{n(i.to_m, 1)}</td>
                          <td className="py-2 pr-3 text-right text-metallic-200">
                            {n(i.interval_m, 1)} m
                          </td>
                          <td className="py-2 pr-3 text-right text-metallic-400">
                            {n(i.true_width_m, 1)}
                          </td>
                          <td className="py-2 pr-3">{i.commodity || '—'}</td>
                          <td className="py-2 text-right text-emerald-300 font-semibold">
                            {i.grade != null
                              ? `${i.grade.toFixed(2)} ${i.grade_unit || ''}`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {data.document && (
              <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-400" /> Source
                  Announcement
                </h2>
                <div className="flex items-center justify-between text-sm bg-metallic-800/40 rounded px-3 py-2">
                  <div>
                    <div className="text-metallic-100">
                      {data.document.title || data.document.document_id}
                    </div>
                    <div className="text-xs text-metallic-500">
                      {data.document.num_pages || '?'} pages
                    </div>
                  </div>
                  {data.document.pdf_url && (
                    <a
                      href={data.document.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary-300 hover:text-primary-200"
                    >
                      Open PDF <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
