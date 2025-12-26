'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EVResourceScatterChart, ValuationBarChart, ResourceCategoryChart } from '@/components/charts';
import { useState } from 'react';
import { Info, Download, Share2 } from 'lucide-react';

interface PeerGroupChartPageProps {
  params: {
    id: string;
  };
}

export default function PeerGroupChartPage({ params }: PeerGroupChartPageProps) {
  const peerId = parseInt(params.id);
  const [activeTab, setActiveTab] = useState<'ev-resource' | 'valuation' | 'resources'>('ev-resource');
  const [commodity, setCommodity] = useState('Au');
  const [metric, setMetric] = useState<'ev_per_aueq_oz' | 'market_cap_usd' | 'p_nav'>('ev_per_aueq_oz');

  // Fetch peer set details
  const { data: peerSet, isLoading: peerLoading } = useQuery({
    queryKey: ['peerSet', peerId],
    queryFn: () => api.getPeerSet(peerId),
    enabled: !!peerId,
  });

  // Fetch EV/Resource chart data
  const { data: evResourceData, isLoading: evLoading } = useQuery({
    queryKey: ['evResource', peerId, commodity],
    queryFn: () => api.getEVResourceChart(peerId, commodity),
    enabled: !!peerId && activeTab === 'ev-resource',
  });

  // Fetch valuation comparison
  const { data: valuationData, isLoading: valLoading } = useQuery({
    queryKey: ['valuation', peerId],
    queryFn: () => api.getValuationComparison(peerId),
    enabled: !!peerId && activeTab === 'valuation',
  });

  // Fetch resource summary
  const { data: resourceData, isLoading: resLoading } = useQuery({
    queryKey: ['resources', peerId],
    queryFn: () => api.getResourceSummary(peerId),
    enabled: !!peerId && activeTab === 'resources',
  });

  const handleExport = async () => {
    try {
      const blob = await api.exportCSV(peerId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `peer_group_${peerId}_export.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (peerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {peerSet?.name || 'Peer Group Analytics'}
            </h1>
            <p className="text-slate-600 mt-1">
              {peerSet?.description || 'Valuation and resource analytics for your peer group'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            {peerSet?.share_token && (
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>
        </div>

        {/* Filters applied */}
        {peerSet?.filters_json && (
          <div className="mt-4 flex flex-wrap gap-2">
            {peerSet.filters_json.exchanges?.map((ex) => (
              <span key={ex} className="filter-pill">{ex}</span>
            ))}
            {peerSet.filters_json.commodities?.map((c) => (
              <span key={c} className="filter-pill">{c}</span>
            ))}
            {peerSet.filters_json.jurisdictions?.map((j) => (
              <span key={j} className="filter-pill">{j}</span>
            ))}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-8">
          {[
            { id: 'ev-resource', label: 'EV vs Resource' },
            { id: 'valuation', label: 'Valuation Metrics' },
            { id: 'resources', label: 'Resource Summary' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Chart Controls */}
      <div className="mb-6 flex items-center gap-4">
        {activeTab === 'ev-resource' && (
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Au">Gold (Au)</option>
            <option value="Ag">Silver (Ag)</option>
            <option value="Cu">Copper (Cu)</option>
            <option value="Li">Lithium (Li)</option>
            <option value="all">All Commodities</option>
          </select>
        )}
        {activeTab === 'valuation' && (
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as typeof metric)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ev_per_aueq_oz">EV per AuEq oz</option>
            <option value="market_cap_usd">Market Cap</option>
            <option value="p_nav">P/NAV Ratio</option>
          </select>
        )}
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {activeTab === 'ev-resource' && (
          evLoading ? (
            <div className="chart-container flex items-center justify-center h-[500px]">
              <div className="spinner" />
            </div>
          ) : evResourceData ? (
            <EVResourceScatterChart data={evResourceData} colorBy="jurisdiction" />
          ) : (
            <div className="chart-container flex items-center justify-center h-[500px]">
              <p className="text-slate-500">No data available</p>
            </div>
          )
        )}

        {activeTab === 'valuation' && (
          valLoading ? (
            <div className="chart-container flex items-center justify-center h-[400px]">
              <div className="spinner" />
            </div>
          ) : valuationData ? (
            <ValuationBarChart data={valuationData} metric={metric} />
          ) : (
            <div className="chart-container flex items-center justify-center h-[400px]">
              <p className="text-slate-500">No data available</p>
            </div>
          )
        )}

        {activeTab === 'resources' && (
          resLoading ? (
            <div className="chart-container flex items-center justify-center h-[400px]">
              <div className="spinner" />
            </div>
          ) : resourceData ? (
            <ResourceCategoryChart data={resourceData} />
          ) : (
            <div className="chart-container flex items-center justify-center h-[400px]">
              <p className="text-slate-500">No data available</p>
            </div>
          )
        )}
      </div>

      {/* Methodology Note */}
      <div className="mt-8 bg-slate-50 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-400 mt-0.5" />
        <div className="text-sm text-slate-600">
          <p className="font-medium text-slate-700 mb-1">Methodology Notes</p>
          <ul className="list-disc list-inside space-y-1">
            <li>EV calculated as Market Cap + Debt - Cash</li>
            <li>AuEq conversions use current commodity prices (see Data Sources)</li>
            <li>Resource categories follow JORC/NI 43-101 classification</li>
            <li>Data last updated: check individual metric lineage for timestamps</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
