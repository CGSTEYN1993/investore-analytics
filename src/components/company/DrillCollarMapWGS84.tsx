'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Globe2 } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Hole {
  hole_id: string;
  lat?: number | null;
  lon?: number | null;
  total_depth_m?: number | null;
  azimuth?: number | null;
  dip?: number | null;
}

interface InterceptLite {
  hole_id: string;
  grade?: number | null;
  commodity?: string | null;
}

interface Props {
  holes: Hole[];
  intercepts: InterceptLite[];
  className?: string;
}

/**
 * WGS84 drill collar map rendered on top of an OpenStreetMap basemap via
 * Plotly's scattermapbox + open-street-map style (no Mapbox token required).
 * Only holes for which the backend was able to project easting/northing to
 * lat/lon are shown.
 */
export default function DrillCollarMapWGS84({
  holes,
  intercepts,
  className = '',
}: Props) {
  const data = useMemo(() => {
    const usable = holes.filter(
      (h) => h.lat != null && h.lon != null,
    );
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
        `<b>${h.hole_id}</b><br>` +
        `Lat / Lon: ${h.lat?.toFixed(5)}, ${h.lon?.toFixed(5)}<br>` +
        `Depth: ${h.total_depth_m?.toFixed(1) ?? '—'} m<br>` +
        `Best grade: ${
          bestByHole.has(h.hole_id)
            ? bestByHole.get(h.hole_id)!.toFixed(2)
            : '—'
        }`,
    );

    // Centre on mean
    const center = {
      lat: lat.reduce((a, b) => a + b, 0) / lat.length,
      lon: lon.reduce((a, b) => a + b, 0) / lon.length,
    };

    return { lat, lon, depths, maxDepth, grades, text, center };
  }, [holes, intercepts]);

  return (
    <section
      className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-primary-400" /> Geographic Collar Map
          (WGS84)
        </h2>
        <span className="text-[10px] uppercase tracking-wide text-metallic-500">
          OpenStreetMap basemap
        </span>
      </div>
      {!data ? (
        <p className="text-sm text-metallic-500">
          No holes could be projected to WGS84 yet — coordinate-system tag is
          missing or unrecognised. The local plan-view above remains accurate.
        </p>
      ) : (
        <Plot
          data={[
            {
              type: 'scattermapbox',
              lat: data.lat,
              lon: data.lon,
              text: data.text,
              hoverinfo: 'text',
              marker: {
                size: data.depths.map(
                  (d) => 8 + (d / data.maxDepth) * 16,
                ),
                color: data.grades.map((g) => (g == null ? 0 : g)) as any,
                colorscale: 'Viridis',
                showscale: data.grades.some((g) => g != null),
                colorbar: { title: 'Best grade', thickness: 10 },
                opacity: 0.9,
              },
            } as any,
          ]}
          layout={{
            autosize: true,
            height: 520,
            margin: { l: 0, r: 0, t: 0, b: 0 },
            paper_bgcolor: '#0f172a00',
            font: { color: '#9ca3af', size: 11 },
            mapbox: {
              style: 'open-street-map',
              center: data.center,
              zoom: 9,
            },
            hovermode: 'closest',
            showlegend: false,
          }}
          useResizeHandler
          style={{ width: '100%' }}
          config={{ displaylogo: false, responsive: true }}
        />
      )}
      <p className="mt-2 text-[10px] text-metallic-600">
        Lat/lon derived server-side via pyproj using each hole&apos;s declared
        coordinate system (MGA94/MGA2020/UTM zones supported).
      </p>
    </section>
  );
}
