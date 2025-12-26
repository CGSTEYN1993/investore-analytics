'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { ValuationComparison } from '@/types';
import { formatCurrency, getStageColor } from '@/lib/utils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface ValuationBarChartProps {
  data: ValuationComparison;
  metric?: 'ev_per_aueq_oz' | 'market_cap_usd' | 'enterprise_value_usd' | 'p_nav';
  sortBy?: 'value' | 'ticker';
  height?: number;
}

export function ValuationBarChart({
  data,
  metric = 'ev_per_aueq_oz',
  sortBy = 'value',
  height = 400,
}: ValuationBarChartProps) {
  const chartData = useMemo(() => {
    if (!data?.companies?.length) return null;

    // Filter companies with valid metric values
    let companies = data.companies.filter((c) => c[metric] != null);

    // Sort
    if (sortBy === 'value') {
      companies = [...companies].sort(
        (a, b) => (Number(a[metric]) || 0) - (Number(b[metric]) || 0)
      );
    } else {
      companies = [...companies].sort((a, b) => a.ticker.localeCompare(b.ticker));
    }

    return {
      x: companies.map((c) => c.ticker),
      y: companies.map((c) => Number(c[metric])),
      text: companies.map((c) => {
        const val = Number(c[metric]);
        if (metric === 'ev_per_aueq_oz') return `$${val.toFixed(2)}/oz`;
        if (metric === 'p_nav') return `${val.toFixed(2)}x`;
        return formatCurrency(val);
      }),
      customdata: companies.map((c) => [c.company_id, c.name, c.exchange] as [number, string, string]),
      type: 'bar' as const,
      marker: {
        color: '#0ea5e9',
        line: {
          width: 0,
        },
      },
      hovertemplate:
        '<b>%{x}</b><br>' +
        '%{customdata.name}<br>' +
        '%{text}<extra></extra>',
    };
  }, [data, metric, sortBy]);

  const metricLabels: Record<string, string> = {
    ev_per_aueq_oz: 'EV per AuEq oz (USD)',
    market_cap_usd: 'Market Cap (USD)',
    enterprise_value_usd: 'Enterprise Value (USD)',
    p_nav: 'Price to NAV Ratio',
  };

  const layout = useMemo(
    () => ({
      title: {
        text: `${metricLabels[metric]} by Company`,
        font: { size: 16, color: '#1e293b' },
      },
      xaxis: {
        title: { text: '' },
        tickangle: -45,
        tickfont: { size: 10 },
      },
      yaxis: {
        title: { text: metricLabels[metric] },
        gridcolor: '#e2e8f0',
        tickprefix: metric === 'p_nav' ? '' : '$',
        tickformat: metric === 'p_nav' ? '.2f' : '.2s',
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: 'Inter, system-ui, sans-serif',
      },
      margin: { t: 60, r: 20, b: 100, l: 80 },
      bargap: 0.3,
    }),
    [metric]
  );

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  if (!chartData) {
    return (
      <div className="chart-container flex items-center justify-center" style={{ height }}>
        <p className="text-slate-500">No data available for chart</p>
      </div>
    );
  }

  // Calculate stats
  const values = chartData.y.filter((v) => v != null) as number[];
  const stats = data.stats?.[metric];

  return (
    <div className="chart-container">
      <Plot
        data={[chartData]}
        layout={layout}
        config={config}
        style={{ width: '100%', height }}
        useResizeHandler
      />
      
      {stats && (
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-slate-500">Min</p>
            <p className="font-semibold">
              {metric === 'p_nav'
                ? stats.min.toFixed(2) + 'x'
                : formatCurrency(stats.min)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500">Median</p>
            <p className="font-semibold">
              {metric === 'p_nav'
                ? stats.median.toFixed(2) + 'x'
                : formatCurrency(stats.median)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500">Average</p>
            <p className="font-semibold">
              {metric === 'p_nav'
                ? stats.avg.toFixed(2) + 'x'
                : formatCurrency(stats.avg)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500">Max</p>
            <p className="font-semibold">
              {metric === 'p_nav'
                ? stats.max.toFixed(2) + 'x'
                : formatCurrency(stats.max)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
