'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, ChevronDown, ArrowUpRight, ArrowDownRight,
  Target, Clock, FlaskConical, CheckCircle2, AlertCircle, Drill, MapPin
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

// Drilling status types
const drillingStatuses = [
  { id: 'active', name: 'Active Drilling', color: '#10B981', icon: Drill, count: 234 },
  { id: 'awaiting-assays', name: 'Awaiting Assays', color: '#FBBF24', icon: FlaskConical, count: 156 },
  { id: 'results-pending', name: 'Results Due Soon', color: '#F97316', icon: Clock, count: 89 },
  { id: 'completed', name: 'Recently Completed', color: '#60A5FA', icon: CheckCircle2, count: 312 },
];

// Mock drilling campaigns
const drillingCampaigns = [
  {
    id: 1,
    company: 'Goldstrike Resources',
    ticker: 'GSR',
    project: 'Red Lake Extension',
    country: 'Canada',
    region: 'Ontario',
    commodity: 'Au',
    status: 'active',
    holesPlanned: 45,
    holesCompleted: 28,
    metersTotal: 12500,
    metersCompleted: 7800,
    startDate: '2024-09-15',
    expectedEnd: '2025-02-15',
    lastUpdate: '2 days ago',
    highlights: 'Intersected 8.5m @ 12.3 g/t Au in hole GS-042',
    change: 12.5,
  },
  {
    id: 2,
    company: 'Copper Summit',
    ticker: 'CSM',
    project: 'Andean Copper Belt',
    country: 'Chile',
    region: 'Atacama',
    commodity: 'Cu',
    status: 'awaiting-assays',
    holesPlanned: 30,
    holesCompleted: 30,
    metersTotal: 9000,
    metersCompleted: 9000,
    startDate: '2024-07-01',
    expectedEnd: '2024-11-30',
    lastUpdate: '1 week ago',
    highlights: 'Phase 1 complete - 85 assays submitted',
    change: -3.2,
  },
  {
    id: 3,
    company: 'Lithium Star',
    ticker: 'LSTR',
    project: 'Salar del Norte',
    country: 'Argentina',
    region: 'Salta',
    commodity: 'Li',
    status: 'results-pending',
    holesPlanned: 20,
    holesCompleted: 20,
    metersTotal: 4000,
    metersCompleted: 4000,
    startDate: '2024-06-15',
    expectedEnd: '2024-10-31',
    lastUpdate: '3 days ago',
    highlights: 'Results expected this week - visual Li observed',
    change: 8.9,
  },
  {
    id: 4,
    company: 'Uranium One',
    ticker: 'URN',
    project: 'Athabasca Basin East',
    country: 'Canada',
    region: 'Saskatchewan',
    commodity: 'U',
    status: 'active',
    holesPlanned: 25,
    holesCompleted: 12,
    metersTotal: 15000,
    metersCompleted: 7200,
    startDate: '2024-10-01',
    expectedEnd: '2025-03-31',
    lastUpdate: '1 day ago',
    highlights: 'Anomalous radioactivity in hole UR-008',
    change: 6.7,
  },
  {
    id: 5,
    company: 'Silver Range',
    ticker: 'SRG',
    project: 'Mexican Silver District',
    country: 'Mexico',
    region: 'Durango',
    commodity: 'Ag',
    status: 'completed',
    holesPlanned: 35,
    holesCompleted: 35,
    metersTotal: 8750,
    metersCompleted: 8750,
    startDate: '2024-05-01',
    expectedEnd: '2024-09-30',
    lastUpdate: '2 weeks ago',
    highlights: 'Final results: 2.1Moz Ag added to resource',
    change: 15.3,
  },
  {
    id: 6,
    company: 'Nickel North',
    ticker: 'NNI',
    project: 'Sudbury Extension',
    country: 'Canada',
    region: 'Ontario',
    commodity: 'Ni',
    status: 'awaiting-assays',
    holesPlanned: 18,
    holesCompleted: 18,
    metersTotal: 5400,
    metersCompleted: 5400,
    startDate: '2024-08-01',
    expectedEnd: '2024-11-15',
    lastUpdate: '5 days ago',
    highlights: 'Massive sulfide intersection in NNI-015',
    change: 4.2,
  },
];

function StatusBadge({ status }: { status: string }) {
  const statusConfig = drillingStatuses.find(s => s.id === status);
  if (!statusConfig) return null;

  const Icon = statusConfig.icon;

  return (
    <div 
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
    >
      <Icon className="w-3 h-3" />
      {statusConfig.name}
    </div>
  );
}

function ProgressBar({ completed, total, color }: { completed: number; total: number; color: string }) {
  const percentage = (completed / total) * 100;
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-metallic-500 mb-1">
        <span>{completed} / {total}</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-metallic-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function DrillingCard({ campaign }: { campaign: typeof drillingCampaigns[0] }) {
  const isPositive = campaign.change >= 0;
  const commodityColor = getCommodityColor(campaign.commodity);
  const statusConfig = drillingStatuses.find(s => s.id === campaign.status);

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:border-primary-500/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: commodityColor }}
          >
            {campaign.commodity}
          </div>
          <div>
            <Link 
              href={`/company/${campaign.ticker}`}
              className="font-semibold text-metallic-100 hover:text-primary-400 transition-colors"
            >
              {campaign.ticker}
            </Link>
            <p className="text-sm text-metallic-500">{campaign.company}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {isPositive ? '+' : ''}{campaign.change}%
        </div>
      </div>

      {/* Project Info */}
      <div className="mb-4">
        <h3 className="font-medium text-metallic-100 mb-1">{campaign.project}</h3>
        <div className="flex items-center gap-2 text-sm text-metallic-500">
          <MapPin className="w-3 h-3" />
          {campaign.region}, {campaign.country}
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <StatusBadge status={campaign.status} />
      </div>

      {/* Progress */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-metallic-500 mb-1">Holes Progress</p>
          <ProgressBar 
            completed={campaign.holesCompleted} 
            total={campaign.holesPlanned} 
            color={statusConfig?.color || '#60A5FA'}
          />
        </div>
        <div>
          <p className="text-xs text-metallic-500 mb-1">Meters Drilled</p>
          <ProgressBar 
            completed={campaign.metersCompleted} 
            total={campaign.metersTotal} 
            color={commodityColor}
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-metallic-800/50 rounded-lg p-3 mb-4">
        <p className="text-xs text-metallic-500 mb-1">Latest Update</p>
        <p className="text-sm text-metallic-300">{campaign.highlights}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-metallic-800 text-xs text-metallic-500">
        <span>Updated {campaign.lastUpdate}</span>
        <Link 
          href={`/company/${campaign.ticker}`}
          className="text-primary-400 hover:text-primary-300"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

export default function DrillingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');

  const commodities = ['all', 'Au', 'Cu', 'Li', 'Ag', 'Ni', 'U', 'Zn', 'Fe'];

  const filteredCampaigns = drillingCampaigns.filter(c => {
    const matchesSearch = 
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesCommodity = selectedCommodity === 'all' || c.commodity === selectedCommodity;
    return matchesSearch && matchesStatus && matchesCommodity;
  });

  const campaignsWithAssaysDue = drillingCampaigns.filter(
    c => c.status === 'awaiting-assays' || c.status === 'results-pending'
  ).length;

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
              <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
              <span>/</span>
              <span className="text-metallic-300">Drilling Activity</span>
            </div>
            <h1 className="text-2xl font-bold text-metallic-100">Drilling Campaigns</h1>
            <p className="text-metallic-400 text-sm">Track active drilling programs and upcoming assay results</p>
          </div>

          {/* Status Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {drillingStatuses.map((status) => {
              const Icon = status.icon;
              return (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id === selectedStatus ? 'all' : status.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedStatus === status.id 
                      ? 'border-primary-500 bg-primary-500/10' 
                      : 'border-metallic-800 bg-metallic-800/50 hover:border-metallic-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" style={{ color: status.color }} />
                    <span className="text-sm text-metallic-400">{status.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-metallic-100">{status.count}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-200">
              <strong>{campaignsWithAssaysDue} companies</strong> are awaiting assay results. Set alerts to get notified when results are released.
            </p>
          </div>
          <Link 
            href="/settings/alerts"
            className="text-sm text-amber-400 hover:text-amber-300 whitespace-nowrap"
          >
            Manage Alerts →
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
            <input
              type="text"
              placeholder="Search companies, projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Statuses</option>
                {drillingStatuses.map((status) => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {commodities.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? 'All Commodities' : c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Drilling Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <DrillingCard key={campaign.id} campaign={campaign} />
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-metallic-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-metallic-100 mb-2">No drilling campaigns found</h3>
            <p className="text-metallic-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
