'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export interface IntervalRow {
  hole_id: string;
  from_m?: number | null;
  to_m?: number | null;
  interval_m?: number | null;
  grade?: number | null;
  grade_unit?: string | null;
  commodity?: string | null;
}

export interface HoleLite {
  hole_id: string;
  total_depth_m?: number | null;
}

interface Props {
  holes: HoleLite[];
  intercepts: IntervalRow[];
  className?: string;
}

/**
 * Downhole strip log per hole. Renders each hole as a vertical bar from
 * 0 → total depth and overlays its assay intervals as coloured rectangles
 * scaled by grade. Lets the geologist eyeball depth of mineralisation,
 * stack of intervals, and grade trends without leaving the page.
 */
export default function DownholeStripLog({
  holes,
  intercepts,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);

  const { holeIds, holeDepths, byHole, maxDepth, maxGrade } = useMemo(() => {
    const byHole = new Map<string, IntervalRow[]>();
    for (const i of intercepts) {
      if (!i.hole_id) continue;
      if (!byHole.has(i.hole_id)) byHole.set(i.hole_id, []);
      byHole.get(i.hole_id)!.push(i);
    }
    // Only show holes that have intercepts
    const holeIds = holes
      .filter((h) => byHole.has(h.hole_id))
      .map((h) => h.hole_id);
    const holeDepths = new Map(
      holes.map((h) => [h.hole_id, h.total_depth_m ?? 0]),
    );
    let maxDepth = 0;
    let maxGrade = 0;
    for (const h of holes)
      if ((h.total_depth_m ?? 0) > maxDepth) maxDepth = h.total_depth_m ?? 0;
    for (const i of intercepts)
      if ((i.grade ?? 0) > maxGrade) maxGrade = i.grade ?? 0;
    return { holeIds, holeDepths, byHole, maxDepth, maxGrade };
  }, [holes, intercepts]);

  const traces = useMemo(() => {
    if (holeIds.length === 0) return [];
    const shafts: any[] = holeIds.map((id) => ({
      type: 'scatter',
      mode: 'lines',
      x: [id, id],
      y: [0, holeDepths.get(id) ?? maxDepth],
      line: { color: '#374151', width: 6 },
      hoverinfo: 'skip',
      showlegend: false,
    }));

    // intervals as colored horizontal lines at each hole
    const intervalTrace: any = {
      type: 'scatter',
      mode: 'markers',
      x: [] as string[],
      y: [] as number[],
      marker: {
        size: [] as number[],
        color: [] as number[],
        colorscale: 'YlOrRd',
        cmin: 0,
        cmax: maxGrade || 1,
        showscale: true,
        colorbar: { title: 'Grade', thickness: 10 },
        symbol: 'square',
        line: { color: '#111827', width: 0.5 },
      },
      text: [] as string[],
      hoverinfo: 'text',
      showlegend: false,
    };

    for (const id of holeIds) {
      const rows = byHole.get(id) || [];
      for (const r of rows) {
        if (r.from_m == null && r.to_m == null) continue;
        const from = r.from_m ?? r.to_m ?? 0;
        const to = r.to_m ?? (r.from_m ?? 0) + (r.interval_m ?? 1);
        const mid = (from + to) / 2;
        const length = Math.max(1, to - from);
        intervalTrace.x.push(id);
        intervalTrace.y.push(mid);
        // marker size scaled to interval length (pixels per meter approx)
        intervalTrace.marker.size.push(Math.min(40, Math.max(6, length * 1.2)));
        intervalTrace.marker.color.push(r.grade ?? 0);
        intervalTrace.text.push(
          `<b>${id}</b><br>${from.toFixed(1)}–${to.toFixed(1)} m ` +
            `(${length.toFixed(1)} m)<br>` +
            `${r.grade != null ? r.grade.toFixed(2) : '—'} ${
              r.grade_unit || ''
            } ${r.commodity || ''}`,
        );
      }
    }
    return [...shafts, intervalTrace];
  }, [holeIds, byHole, holeDepths, maxDepth, maxGrade]);

  if (holeIds.length === 0) return null;

  return (
    <section
      className={`bg-metallic-900 border border-metallic-800 rounded-xl ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-400" /> Downhole Strip
          Logs
          <span className="text-xs text-metallic-500 font-normal">
            · {holeIds.length} hole{holeIds.length === 1 ? '' : 's'}
          </span>
        </span>
        {open ? (
          <ChevronDown className="w-5 h-5 text-metallic-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-metallic-500" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-6">
          <Plot
            data={traces as any}
            layout={{
              autosize: true,
              height: Math.max(420, 40 * holeIds.length + 120),
              margin: { l: 60, r: 30, t: 10, b: 80 },
              paper_bgcolor: '#0f172a00',
              plot_bgcolor: '#0b1220',
              font: { color: '#9ca3af', size: 11 },
              xaxis: {
                title: { text: 'Drill hole' },
                type: 'category',
                gridcolor: '#1f2937',
                tickangle: -45,
              },
              yaxis: {
                title: { text: 'Depth (m)' },
                autorange: 'reversed',
                gridcolor: '#1f2937',
              },
              hovermode: 'closest',
            }}
            useResizeHandler
            style={{ width: '100%' }}
            config={{ displaylogo: false, responsive: true }}
          />
          <p className="mt-2 text-[10px] text-metallic-600">
            Each vertical bar = a drill hole from surface to total depth.
            Squares mark assayed intervals: position = mid-depth, size =
            interval thickness, colour = grade. Y-axis is inverted so deeper
            is lower.
          </p>
        </div>
      )}
    </section>
  );
}
