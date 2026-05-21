'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Globe2, Square } from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Hole {
  hole_id: string;
  lat?: number | null;
  lon?: number | null;
  total_depth_m?: number | null;
}

interface InterceptLite {
  hole_id: string;
  grade?: number | null;
}

interface Tenement {
  id: number;
  tenement_id: string;
  name?: string | null;
  type?: string | null;
  status?: string | null;
  geometry?: any | null;
  centroid?: { lat: number; lon: number } | null;
}

interface Props {
  ticker: string;
  project: string;
  holes: Hole[];
  intercepts: InterceptLite[];
  className?: string;
}

/**
 * WGS84 collar map enriched with tenement polygons when available. Uses
 * Plotly scattermapbox with the open-street-map style (no token).
 */
export default function ProjectMap({
  ticker,
  project,
  holes,
  intercepts,
  className = '',
}: Props) {
  const [tenements, setTenements] = useState<Tenement[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(
          `${RAILWAY_API_URL}/api/v1/mining/company/${encodeURIComponent(ticker)}` +
            `/projects/${encodeURIComponent(project)}/tenements`,
        );
        if (!r.ok) return;
        const j = await r.json();
        if (!cancelled) setTenements(j.tenements || []);
      } catch {
        /* tenements optional */
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ticker, project]);

  const collars = useMemo(() => {
    const usable = holes.filter((h) => h.lat != null && h.lon != null);
    if (usable.length === 0) return null;
    const bestByHole = new Map<string, number>();
    for (const i of intercepts) {
      if (i.grade == null) continue;
      const cur = bestByHole.get(i.hole_id) ?? -Infinity;
      if (i.grade > cur) bestByHole.set(i.hole_id, i.grade);
    }
    const lat = usable.map((h) => h.lat as number);
    const lon = usable.map((h) => h.lon as number);
    const depths = usable.map((h) => h.total_depth_m ?? 0);
    const maxDepth = Math.max(1, ...depths);
    const grades = usable.map((h) => bestByHole.get(h.hole_id) ?? null);
    const text = usable.map(
      (h) =>
        `<b>${h.hole_id}</b><br>${h.lat?.toFixed(5)}, ${h.lon?.toFixed(5)}<br>` +
        `Depth: ${h.total_depth_m?.toFixed(1) ?? '—'} m`,
    );
    return { lat, lon, depths, maxDepth, grades, text };
  }, [holes, intercepts]);

  const polygonTraces = useMemo(() => {
    const traces: any[] = [];
    for (const t of tenements) {
      const g = t.geometry;
      if (!g) continue;
      const polys =
        g.type === 'Polygon'
          ? [g.coordinates]
          : g.type === 'MultiPolygon'
          ? g.coordinates
          : [];
      for (const poly of polys) {
        const ring = poly?.[0] || [];
        if (ring.length < 3) continue;
        traces.push({
          type: 'scattermapbox',
          mode: 'lines',
          lon: ring.map((p: number[]) => p[0]),
          lat: ring.map((p: number[]) => p[1]),
          line: { color: '#fbbf24', width: 2 },
          fill: 'toself',
          fillcolor: 'rgba(251,191,36,0.10)',
          hoverinfo: 'text',
          text: `${t.tenement_id}${t.name ? ` · ${t.name}` : ''}${
            t.status ? ` (${t.status})` : ''
          }`,
          showlegend: false,
        });
      }
    }
    return traces;
  }, [tenements]);

  const allLat: number[] = [
    ...(collars?.lat || []),
    ...tenements.flatMap((t) => (t.centroid ? [t.centroid.lat] : [])),
  ];
  const allLon: number[] = [
    ...(collars?.lon || []),
    ...tenements.flatMap((t) => (t.centroid ? [t.centroid.lon] : [])),
  ];
  const center =
    allLat.length > 0
      ? {
          lat: allLat.reduce((a, b) => a + b, 0) / allLat.length,
          lon: allLon.reduce((a, b) => a + b, 0) / allLon.length,
        }
      : null;

  if (!collars && polygonTraces.length === 0) {
    return (
      <section
        className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}
      >
        <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2 mb-2">
          <Globe2 className="w-5 h-5 text-primary-400" /> Geographic Map
        </h2>
        <p className="text-sm text-metallic-500">
          No WGS84 collars or tenement polygons available for this project
          yet. Run the WA tenement ETL or wait for coordinate-system tags to
          be captured.
        </p>
      </section>
    );
  }

  const traces: any[] = [...polygonTraces];
  if (collars) {
    traces.push({
      type: 'scattermapbox',
      lat: collars.lat,
      lon: collars.lon,
      text: collars.text,
      hoverinfo: 'text',
      marker: {
        size: collars.depths.map((d) => 8 + (d / collars.maxDepth) * 16),
        color: collars.grades.map((g) => (g == null ? 0 : g)) as any,
        colorscale: 'Viridis',
        showscale: collars.grades.some((g) => g != null),
        colorbar: { title: 'Best grade', thickness: 10 },
        opacity: 0.9,
      },
      showlegend: false,
    });
  }

  return (
    <section
      className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-primary-400" /> Geographic Map
        </h2>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide text-metallic-500">
          {tenements.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Square className="w-3 h-3 text-amber-400" />
              {tenements.length} tenement(s)
            </span>
          )}
          <span>OSM basemap</span>
        </div>
      </div>
      <Plot
        data={traces}
        layout={{
          autosize: true,
          height: 540,
          margin: { l: 0, r: 0, t: 0, b: 0 },
          paper_bgcolor: '#0f172a00',
          font: { color: '#9ca3af', size: 11 },
          mapbox: {
            style: 'open-street-map',
            center: center || { lat: -26.5, lon: 121.5 },
            zoom: 8,
          },
          hovermode: 'closest',
          showlegend: false,
        }}
        useResizeHandler
        style={{ width: '100%' }}
        config={{ displaylogo: false, responsive: true }}
      />
      <p className="mt-2 text-[10px] text-metallic-600">
        Tenement polygons from jurisdictional ETLs (e.g. WA DMIRS MINEDEX) ·
        collar lat/lon derived server-side from declared MGA/UTM zones.
      </p>
    </section>
  );
}
