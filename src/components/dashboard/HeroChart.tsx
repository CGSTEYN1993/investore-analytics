'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const HeroChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [layout, setLayout] = useState<any>({});

  useEffect(() => {
    // Generate dummy data for a "Live" feel
    const xValues = Array.from({ length: 50 }, (_, i) => i);
    const yValues1 = xValues.map(x => 100 + Math.random() * 20 + Math.sin(x / 5) * 10);
    const yValues2 = xValues.map(x => 80 + Math.random() * 15 + Math.cos(x / 5) * 10);

    setData([
      {
        x: xValues,
        y: yValues1,
        type: 'scatter',
        mode: 'lines',
        name: 'Gold Futures',
        line: { color: '#f59e0b', width: 2 }, // Amber/Gold
        fill: 'tozeroy',
        fillcolor: 'rgba(245, 158, 11, 0.1)',
      },
      {
        x: xValues,
        y: yValues2,
        type: 'scatter',
        mode: 'lines',
        name: 'Copper Spot',
        line: { color: '#0f766e', width: 2 }, // Teal
      },
    ]);

    setLayout({
      autosize: true,
      height: 350,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 40, r: 20, t: 20, b: 40 },
      showlegend: true,
      legend: { orientation: 'h', y: 1.1, x: 0.5, xanchor: 'center', font: { color: '#94a3b8' } },
      xaxis: {
        showgrid: true,
        gridcolor: '#334155',
        zeroline: false,
        tickfont: { color: '#94a3b8' },
      },
      yaxis: {
        showgrid: true,
        gridcolor: '#334155',
        zeroline: false,
        tickfont: { color: '#94a3b8' },
      },
    });
  }, []);

  return (
    <div className="w-full h-full min-h-[350px] rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur-sm p-2 shadow-xl">
      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 mb-2">
        <h3 className="text-slate-200 font-mono text-sm">MARKET_OVERVIEW_V1.0</h3>
        <div className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-green-500 font-mono">LIVE</span>
        </div>
      </div>
      <Plot
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default HeroChart;
