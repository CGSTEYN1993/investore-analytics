'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Map as MapIcon } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Hole {
  hole_id: string;
  easting?: number | null;
  northing?: number | null;
  total_depth_m?: number | null;
  drill_type?: string | null;
  coordinate_system?: string | null;
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
 * Plan-view scatter of drill collars in their native easting/northing.
 * Marker size = total depth, color = best grade in that hole.
 * Pure relative geometry — no basemap, no projection needed — gives a
 * scientifically faithful collar layout even when coordinate_system is MGA/UTM.
 */
export default function DrillCollarMap({ holes, intercepts, className = '' }: Props) {
  const data = useMemo(() => {
    const usable = holes.filter(
      (h) => h.easting != null && h.northing != null,
    );
    if (usable.length === 0) return null;

    // best grade per hole
    const bestByHole = new Map<string, number>();
    for (const i of intercepts) {
      if (i.grade == null) continue;
      const cur = bestByHole.get(i.hole_id) ?? -Infinity;
      if (i.grade > cur) bestByHole.set(i.hole_id, i.grade);
    }

    const x = usable.map((h) => h.easting as number);
    const y = usable.map((h) => h.northing as number);
    const grades = usable.map((h) => bestByHole.get(h.hole_id) ?? null);
    const depths = usable.map((h) => h.total_depth_m ?? 0);
    const maxDepth = Math.max(1, ...depths);
    const text = usable.map(
      (h) =>
        `<b>${h.hole_id}</b><br>` +
        `Depth: ${h.total_depth_m?.toFixed(1) ?? '—'} m<br>` +
        `Az / Dip: ${h.azimuth?.toFixed(0) ?? '—'}° / ${
          h.dip?.toFixed(0) ?? '—'
        }°<br>` +
        `Best grade: ${
          bestByHole.has(h.hole_id)
            ? bestByHole.get(h.hole_id)!.toFixed(2)
            : '—'
        }`,
    );

    return {
      x,
      y,
      grades,
      depths,
      maxDepth,
      text,
      cs: usable[0].coordinate_system,
    };
  }, [holes, intercepts]);

  return (
    <section
      className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-primary-400" /> Drill Collar Plan View
        </h2>
        {data?.cs && (
          <span className="text-[10px] uppercase tracking-wide text-metallic-500">
            {data.cs}
          </span>
        )}
      </div>
      {!data ? (
        <p className="text-sm text-metallic-500">
          No collar coordinates extracted yet for this project. Holes will
          appear here once easting / northing are captured from announcement
          tables.
        </p>
      ) : (
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: data.x,
              y: data.y,
              text: data.text,
              hoverinfo: 'text',
              marker: {
                size: data.depths.map(
                  (d) => 8 + (d / data.maxDepth) * 18,
                ),
                color: data.grades.map((g) => (g == null ? 0 : g)) as any,
                colorscale: 'Viridis',
                showscale: data.grades.some((g) => g != null),
                colorbar: { title: 'Best grade', thickness: 10 },
                line: { color: '#1f2937', width: 1 },
                opacity: 0.9,
              },
            } as any,
          ]}
          layout={{
            autosize: true,
            height: 480,
            margin: { l: 60, r: 30, t: 10, b: 50 },
            paper_bgcolor: '#0f172a00',
            plot_bgcolor: '#0b1220',
            font: { color: '#9ca3af', size: 11 },
            xaxis: {
              title: { text: 'Easting (m)' },
              gridcolor: '#1f2937',
              zeroline: false,
              scaleanchor: 'y',
              scaleratio: 1,
            },
            yaxis: {
              title: { text: 'Northing (m)' },
              gridcolor: '#1f2937',
              zeroline: false,
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
        Marker size = total hole depth · colour = peak intercept grade · axes
        preserve true 1:1 scale.
      </p>
    </section>
  );
}
