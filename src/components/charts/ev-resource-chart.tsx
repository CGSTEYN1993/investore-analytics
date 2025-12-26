'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { EVResourceChart as EVResourceChartData } from '@/types';
import { formatCurrency, formatMetal, getCommodityColor } from '@/lib/utils';

// Dynamic import for Plotly (SSR disabled)
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface EVResourceChartProps {
  data: EVResourceChartData;
  colorBy?: 'jurisdiction' | 'commodity';
  showTrendline?: boolean;
  height?: number;
}

export function EVResourceScatterChart({
  data,
  colorBy = 'jurisdiction',
  showTrendline = true,
  height = 500,
}: EVResourceChartProps) {
  const chartData = useMemo(() => {
    if (!data?.data_points?.length) return [];

    // Group by color category
    const groups: Record<string, typeof data.data_points> = {};
    
    data.data_points.forEach((point) => {
      const key = colorBy === 'jurisdiction' ? point.jurisdiction : point.commodity;
      if (!groups[key]) groups[key] = [];
      groups[key].push(point);
    });

    // Create trace for each group
    return Object.entries(groups).map(([groupName, points]) => ({
      x: points.map((p) => p.contained_metal),
      y: points.map((p) => Number(p.enterprise_value_usd)),
      text: points.map(
        (p) =>
          `<b>${p.ticker}</b> - ${p.name}<br>` +
          `EV: ${formatCurrency(Number(p.enterprise_value_usd))}<br>` +
          `Resource: ${formatMetal(p.contained_metal, 'oz')}<br>` +
          `Jurisdiction: ${p.jurisdiction}`
      ),
      customdata: points.map((p) => ({
        id: p.company_id,
        ticker: p.ticker,
      })),
      name: groupName,
      type: 'scatter' as const,
      mode: 'markers' as const,
      marker: {
        size: 12,
        opacity: 0.8,
        color: colorBy === 'commodity' ? getCommodityColor(groupName) : undefined,
        line: {
          width: 1,
          color: '#fff',
        },
      },
      hovertemplate: '%{text}<extra></extra>',
    }));
  }, [data, colorBy]);

  const layout = useMemo(
    () => ({
      title: {
        text: 'Enterprise Value vs. Contained Resource',
        font: { size: 18, color: '#1e293b' },
      },
      xaxis: {
        title: data.x_label || 'Contained Metal (oz AuEq)',
        type: 'log' as const,
        gridcolor: '#e2e8f0',
        tickformat: '.2s',
      },
      yaxis: {
        title: data.y_label || 'Enterprise Value (USD)',
        type: 'log' as const,
        gridcolor: '#e2e8f0',
        tickprefix: '$',
        tickformat: '.2s',
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: 'Inter, system-ui, sans-serif',
      },
      legend: {
        orientation: 'h' as const,
        y: -0.15,
        x: 0.5,
        xanchor: 'center' as const,
      },
      margin: { t: 60, r: 40, b: 80, l: 80 },
      hovermode: 'closest' as const,
    }),
    [data]
  );

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'] as const,
    displaylogo: false,
  };

  if (!data?.data_points?.length) {
    return (
      <div className="chart-container flex items-center justify-center" style={{ height }}>
        <p className="text-slate-500">No data available for chart</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <Plot
        data={chartData}
        layout={layout}
        config={config}
        style={{ width: '100%', height }}
        useResizeHandler
      />
      <div className="mt-4 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Generated: {new Date(data.generated_at).toLocaleString()}
        </span>
        <span>
          Log-log scale • {data.data_points.length} companies
        </span>
      </div>
    </div>
  );
}
