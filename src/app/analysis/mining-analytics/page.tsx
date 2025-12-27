'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { 
  Database, TrendingUp, MapPin, Pickaxe, Gem, Mountain, 
  BarChart3, PieChart, Loader2, RefreshCw, ArrowUpRight,
  Building2, Globe, Zap, AlertCircle
} from 'lucide-react';
import { useGeoscienceData } from '@/hooks/useGeoscienceData';
import { getCommodityColor, COMMODITY_COLORS } from '@/types/geoscience';

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  trend 
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <ArrowUpRight className={`w-4 h-4 ${trend.value < 0 ? 'rotate-90' : ''}`} />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-metallic-100">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-metallic-400 text-sm mt-1">{title}</p>
      {subtitle && <p className="text-metallic-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

// Bar Chart Component (Simple SVG)
function SimpleBarChart({ 
  data, 
  maxBars = 10 
}: { 
  data: { label: string; value: number; color: string }[];
  maxBars?: number;
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  const displayData = data.slice(0, maxBars);

  return (
    <div className="space-y-2">
      {displayData.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <span className="text-xs text-metallic-400 w-20 truncate" title={item.label}>
            {item.label}
          </span>
          <div className="flex-1 bg-metallic-800 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color
              }}
            />
          </div>
          <span className="text-xs text-metallic-300 w-12 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// Donut Chart Component (Simple SVG)
function DonutChart({ 
  data,
  size = 160 
}: { 
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const center = size / 2;
  const radius = size * 0.4;
  const strokeWidth = size * 0.15;
  
  let currentAngle = -90;
  
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size}>
        {data.map((item, idx) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          
          // Calculate arc path
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = ((startAngle + angle) * Math.PI) / 180;
          
          const x1 = center + radius * Math.cos(startRad);
          const y1 = center + radius * Math.sin(startRad);
          const x2 = center + radius * Math.cos(endRad);
          const y2 = center + radius * Math.sin(endRad);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          return (
            <path
              key={idx}
              d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              stroke="#1a1a2e"
              strokeWidth="2"
            />
          );
        })}
        {/* Center hole */}
        <circle cx={center} cy={center} r={radius * 0.5} fill="#0f0f1a" />
        <text 
          x={center} 
          y={center - 5} 
          textAnchor="middle" 
          fill="#fff" 
          fontSize="18" 
          fontWeight="bold"
        >
          {total.toLocaleString()}
        </text>
        <text 
          x={center} 
          y={center + 12} 
          textAnchor="middle" 
          fill="#888" 
          fontSize="10"
        >
          Total
        </text>
      </svg>
      
      <div className="flex-1 space-y-2">
        {data.slice(0, 6).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-metallic-300 flex-1">{item.label}</span>
            <span className="text-xs text-metallic-500">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Critical Minerals Spotlight
function CriticalMineralsSpotlight({ minerals }: { minerals: any[] }) {
  const criticalList = [
    { name: 'Lithium', symbol: 'Li', use: 'Batteries & EVs' },
    { name: 'Cobalt', symbol: 'Co', use: 'Battery cathodes' },
    { name: 'Rare earth', symbol: 'REE', use: 'Magnets & electronics' },
    { name: 'Nickel', symbol: 'Ni', use: 'Stainless steel & batteries' },
    { name: 'Manganese', symbol: 'Mn', use: 'Steel & batteries' },
    { name: 'Graphite', symbol: 'C', use: 'Battery anodes' },
  ];

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-metallic-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Critical Minerals
        </h3>
        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
          Clean Energy Focus
        </span>
      </div>
      
      <p className="text-xs text-metallic-500 mb-4">
        Essential minerals for renewable energy and advanced technologies
      </p>

      <div className="grid grid-cols-2 gap-3">
        {criticalList.map((mineral) => {
          const count = minerals.filter(m => 
            m.commodity?.toLowerCase().includes(mineral.name.toLowerCase())
          ).length;
          
          return (
            <div 
              key={mineral.symbol}
              className="bg-metallic-800/50 rounded-lg p-3 hover:bg-metallic-800 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-cyan-400">{mineral.symbol}</span>
                <span className="text-sm text-metallic-100">{mineral.name}</span>
              </div>
              <p className="text-xs text-metallic-500">{mineral.use}</p>
              <p className="text-xs text-metallic-400 mt-1">
                <span className="font-medium text-metallic-200">{count}</span> deposits
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// State Distribution Map
function StateDistribution({ mines }: { mines: any[] }) {
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {
      WA: 0, QLD: 0, NSW: 0, VIC: 0, SA: 0, NT: 0, TAS: 0
    };
    mines.forEach(m => {
      if (m.state && counts[m.state] !== undefined) {
        counts[m.state]++;
      }
    });
    return counts;
  }, [mines]);

  const maxCount = Math.max(...Object.values(stateCounts));

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <h3 className="font-semibold text-metallic-100 flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary-500" />
        Distribution by State
      </h3>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Object.entries(stateCounts).map(([state, count]) => {
          const intensity = count / maxCount;
          return (
            <div 
              key={state}
              className="text-center p-3 rounded-lg transition-colors"
              style={{ 
                backgroundColor: `rgba(59, 130, 246, ${intensity * 0.5 + 0.1})` 
              }}
            >
              <p className="text-sm font-bold text-metallic-100">{count}</p>
              <p className="text-xs text-metallic-400">{state}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-metallic-500">
        <span>Western Australia leads with {stateCounts.WA} operations</span>
        <Link href="/analysis/australia" className="text-primary-400 hover:text-primary-300">
          View Map →
        </Link>
      </div>
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  const { data, stats, isLoading, error, refresh } = useGeoscienceData();

  // Calculate analytics from data
  const analytics = useMemo(() => {
    if (!data) return null;

    const { operating_mines, critical_minerals, mineral_deposits } = data;

    // Commodity breakdown
    const commodityCounts: Record<string, number> = {};
    [...operating_mines, ...critical_minerals, ...mineral_deposits].forEach(f => {
      if (f.commodity) {
        const primary = f.commodity.split(',')[0].trim();
        commodityCounts[primary] = (commodityCounts[primary] || 0) + 1;
      }
    });

    const topCommodities = Object.entries(commodityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, value]) => ({
        label,
        value,
        color: getCommodityColor(label)
      }));

    // State breakdown for mines
    const stateCounts: Record<string, number> = {};
    operating_mines.forEach(m => {
      if (m.state) {
        stateCounts[m.state] = (stateCounts[m.state] || 0) + 1;
      }
    });

    const stateData = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], idx) => ({
        label,
        value,
        color: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'][idx] || '#94a3b8'
      }));

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    operating_mines.forEach(m => {
      const status = m.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return {
      topCommodities,
      stateData,
      statusCounts,
      totalFeatures: data.total_features,
      uniqueCommodities: Object.keys(commodityCounts).length,
      uniqueStates: Object.keys(stateCounts).length,
    };
  }, [data]);

  if (error) {
    return (
      <div className="min-h-screen bg-metallic-950 flex items-center justify-center">
        <div className="bg-metallic-900 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-metallic-100 mb-2">Error Loading Data</h2>
          <p className="text-metallic-400 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
            <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
            <span>/</span>
            <span className="text-metallic-300">Mining Analytics</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-metallic-100 flex items-center gap-3">
                Australian Mining Analytics
                <span className="text-xs font-normal bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                  Geoscience Australia Data
                </span>
              </h1>
              <p className="text-metallic-400 text-sm">
                Comprehensive insights from authoritative government databases
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-metallic-800 hover:bg-metallic-700 rounded-lg text-metallic-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <p className="text-metallic-400">Loading analytics from Geoscience Australia...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Operating Mines"
                value={data?.operating_mines.length || 0}
                subtitle="Active mining operations across Australia"
                icon={Pickaxe}
                color="#22c55e"
              />
              <StatCard
                title="Critical Mineral Sites"
                value={data?.critical_minerals.length || 0}
                subtitle="Strategic mineral deposits"
                icon={Gem}
                color="#06b6d4"
              />
              <StatCard
                title="Mineral Deposits"
                value={data?.mineral_deposits.length || 0}
                subtitle="From OZMIN database"
                icon={Mountain}
                color="#f59e0b"
              />
              <StatCard
                title="Unique Commodities"
                value={analytics?.uniqueCommodities || 0}
                subtitle="Different mineral types tracked"
                icon={Database}
                color="#8b5cf6"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Commodity Distribution */}
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                <h3 className="font-semibold text-metallic-100 flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-primary-500" />
                  Top Commodities
                </h3>
                {analytics && (
                  <SimpleBarChart data={analytics.topCommodities} maxBars={10} />
                )}
              </div>

              {/* State Distribution */}
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                <h3 className="font-semibold text-metallic-100 flex items-center gap-2 mb-6">
                  <PieChart className="w-5 h-5 text-primary-500" />
                  Mines by State
                </h3>
                {analytics && analytics.stateData.length > 0 && (
                  <DonutChart data={analytics.stateData} />
                )}
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Critical Minerals Spotlight */}
              <CriticalMineralsSpotlight 
                minerals={[...(data?.critical_minerals || []), ...(data?.mineral_deposits || [])]} 
              />

              {/* State Distribution Heat */}
              <StateDistribution mines={data?.operating_mines || []} />
            </div>

            {/* Data Source Info */}
            <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-metallic-100 mb-1">Data Source</h3>
                  <p className="text-sm text-metallic-400 mb-3">
                    This dashboard displays live data from Geoscience Australia's open data portal. 
                    Data includes the Australian Operating Mines Map, Critical Minerals database, 
                    and OZMIN mineral deposits database.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="https://portal.ga.gov.au"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-metallic-800 hover:bg-metallic-700 text-metallic-300 px-3 py-1.5 rounded transition-colors"
                    >
                      GA Portal →
                    </a>
                    <a 
                      href="https://services.ga.gov.au"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-metallic-800 hover:bg-metallic-700 text-metallic-300 px-3 py-1.5 rounded transition-colors"
                    >
                      API Services →
                    </a>
                    <span className="text-xs text-metallic-500 flex items-center gap-1">
                      Last updated: {data?.last_updated || 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/analysis/australia"
                className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:bg-metallic-800/50 transition-colors group"
              >
                <MapPin className="w-8 h-8 text-green-400 mb-3" />
                <h4 className="font-semibold text-metallic-100 mb-1 group-hover:text-primary-400 transition-colors">
                  Interactive Map
                </h4>
                <p className="text-sm text-metallic-500">
                  Explore mines and deposits on an interactive Australia map
                </p>
              </Link>
              
              <Link 
                href="/analysis/exploration"
                className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:bg-metallic-800/50 transition-colors group"
              >
                <Mountain className="w-8 h-8 text-amber-400 mb-3" />
                <h4 className="font-semibold text-metallic-100 mb-1 group-hover:text-primary-400 transition-colors">
                  Exploration Data
                </h4>
                <p className="text-sm text-metallic-500">
                  View drilling, geochemistry, and sampling data
                </p>
              </Link>
              
              <Link 
                href="/analysis/peers"
                className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:bg-metallic-800/50 transition-colors group"
              >
                <Building2 className="w-8 h-8 text-purple-400 mb-3" />
                <h4 className="font-semibold text-metallic-100 mb-1 group-hover:text-primary-400 transition-colors">
                  Company Analysis
                </h4>
                <p className="text-sm text-metallic-500">
                  Compare mining companies and valuations
                </p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
