'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { ResourceSummary } from '@/types';
import { formatNumber, getCommodityColor, COMMODITY_LABELS } from '@/lib/utils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface ResourceCategoryChartProps {
  data: ResourceSummary[];
  height?: number;
}

export function ResourceCategoryChart({ data, height = 400 }: ResourceCategoryChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];

    const categories = ['measured', 'indicated', 'inferred', 'proven', 'probable'];
    const categoryColors: Record<string, string> = {
      measured: '#22c55e',
      indicated: '#3b82f6',
      inferred: '#94a3b8',
      proven: '#059669',
      probable: '#0891b2',
    };

    // Create stacked bar traces for each category
    return categories.map((category) => ({
      x: data.map((d) => COMMODITY_LABELS[d.commodity] || d.commodity),
      y: data.map((d) => Number(d.category_breakdown?.[category] || 0)),
      name: category.charAt(0).toUpperCase() + category.slice(1),
      type: 'bar' as const,
      marker: {
        color: categoryColors[category],
      },
      hovertemplate:
        '<b>%{x}</b><br>' +
        `${category.charAt(0).toUpperCase() + category.slice(1)}: %{y:.2s}<extra></extra>`,
    }));
  }, [data]);

  const layout = useMemo(
    () => ({
      title: {
        text: 'Resource Category Breakdown by Commodity',
        font: { size: 16, color: '#1e293b' },
      },
      xaxis: {
        title: 'Commodity',
      },
      yaxis: {
        title: 'Contained Metal',
        tickformat: '.2s',
      },
      barmode: 'stack' as const,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: 'Inter, system-ui, sans-serif',
      },
      legend: {
        orientation: 'h' as const,
        y: -0.2,
        x: 0.5,
        xanchor: 'center' as const,
      },
      margin: { t: 60, r: 20, b: 80, l: 80 },
    }),
    []
  );

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  if (!data?.length) {
    return (
      <div className="chart-container flex items-center justify-center" style={{ height }}>
        <p className="text-slate-500">No resource data available</p>
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
      
      {/* Summary table */}
      <div className="mt-4 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Commodity</th>
              <th className="text-right">Total Tonnage</th>
              <th className="text-right">Avg Grade</th>
              <th className="text-right">Contained Metal</th>
            </tr>
          </thead>
          <tbody>
            {data.map((resource) => (
              <tr key={resource.commodity}>
                <td className="font-medium">
                  {COMMODITY_LABELS[resource.commodity] || resource.commodity}
                </td>
                <td className="text-right">
                  {formatNumber(resource.total_tonnage, 0)} t
                </td>
                <td className="text-right">
                  {formatNumber(Number(resource.avg_grade), 2)} {resource.grade_unit}
                </td>
                <td className="text-right">
                  {formatNumber(resource.total_contained_metal, 0)} {resource.metal_unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
