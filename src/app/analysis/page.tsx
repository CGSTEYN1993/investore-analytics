'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, Building2, MapPin, TrendingUp, 
  Search, ChevronRight, Gem, FileText, Clock,
  Sparkles, MessageSquare, Target, AlertTriangle, Bell, Activity,
  BarChart3, Briefcase, Bookmark, Database, Layers, Factory, Hammer
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';

// Interface for dynamic stats from API
interface SpatialSummary {
  total_companies: number;
  by_exchange: Record<string, number>;
  by_commodity: [string, number][];
  total_countries: number;
}

// AI Research Analyst features from the design
const aiFeatures = [
  {
    id: 'announcement-interpreter',
    title: 'Announcement Interpreter',
    description: 'AI parses dense technical reports and extracts key metrics, drill results, and resource updates in seconds.',
    icon: FileText,
    badge: 'Save 5+ hours per week',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    id: 'natural-language-search',
    title: 'Natural Language Search',
    description: "Ask questions like 'Show me gold explorers in Canada with >1M oz resource trading below $50/oz'",
    icon: MessageSquare,
    badge: 'No complex filters needed',
    badgeColor: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    id: 'valuation-explainer',
    title: 'Valuation Explainer',
    description: 'AI explains why Company X trades at 0.4x NAV vs peer average 0.7x — instant investment thesis.',
    icon: Target,
    badge: 'Understand the discount',
    badgeColor: 'bg-purple-500/20 text-purple-400',
  },
  {
    id: 'risk-detection',
    title: 'Risk Detection',
    description: 'Auto-detect red flags: jurisdiction risk, management changes, dilution patterns, insider selling.',
    icon: AlertTriangle,
    badge: 'Protect your capital',
    badgeColor: 'bg-red-500/20 text-red-400',
    iconColor: 'text-red-400',
  },
  {
    id: 'opportunity-alerts',
    title: 'Opportunity Alerts',
    description: 'Get notified when a company announces results that historically lead to significant re-rates.',
    icon: Bell,
    badge: 'Be first to act',
    badgeColor: 'bg-amber-500/20 text-amber-400',
  },
  {
    id: 'sentiment-scoring',
    title: 'Sentiment Scoring',
    description: 'Aggregate news, social media, and insider activity into a daily sentiment score for each stock.',
    icon: Activity,
    badge: 'Gauge market mood',
    badgeColor: 'bg-blue-500/20 text-blue-400',
  },
];

// Global Spatial View sub-categories
const spatialCategories = [
  {
    id: 'by-exchange',
    title: 'By Exchange',
    description: 'TSX, ASX, NYSE, JSE, and more',
    href: '/analysis/exchanges',
    icon: Building2,
  },
  {
    id: 'by-commodity',
    title: 'By Commodity',
    description: '30+ commodities tracked',
    href: '/analysis/commodities',
    icon: Gem,
  },
  {
    id: 'by-country',
    title: 'By Country',
    description: 'Global coverage',
    href: '/analysis/countries',
    icon: Globe,
  },
  {
    id: 'geoscience',
    title: 'Geoscience Data',
    description: 'Government mining databases',
    href: '/analysis/global?country=Australia',
    icon: Database,
  },
];

// Mining Analytics sub-categories
const analyticsCategories = [
  {
    id: 'market-data',
    title: 'Market Data',
    description: 'Real-time prices & volume',
    href: '/analysis/market',
    icon: TrendingUp,
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Latest company news',
    href: '/analysis/announcements',
    icon: FileText,
  },
  {
    id: 'exploration',
    title: 'Exploration Data',
    description: 'Drilling & surveys',
    href: '/analysis/exploration',
    icon: Factory,
  },
  {
    id: 'project-stages',
    title: 'Project Stages',
    description: 'Explorer to producer',
    href: '/analysis/stages',
    icon: Hammer,
  },
  {
    id: 'compare',
    title: 'Peer Comparison',
    description: 'Side-by-side analysis',
    href: '/analysis/compare',
    icon: BarChart3,
  },
  {
    id: 'constraints',
    title: 'Legal Constraints',
    description: 'Heritage & environmental',
    href: '/analysis/constraints',
    icon: MapPin,
  },
];

export default function AnalysisDashboard() {
  const [dynamicStats, setDynamicStats] = useState<SpatialSummary | null>(null);
  
  // Fetch dynamic stats from the API
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/spatial/summary`);
        if (response.ok) {
          const data = await response.json();
          setDynamicStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch spatial summary:', err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-metallic-100">Analysis Dashboard</h1>
              <p className="text-metallic-400 mt-1">Your complete mining intelligence platform</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/portfolio"
                className="flex items-center gap-2 px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 hover:bg-metallic-700 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                <span>Portfolio</span>
              </Link>
              <Link
                href="/watchlist"
                className="flex items-center gap-2 px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 hover:bg-metallic-700 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>Watchlist</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700/50">
              <div className="text-2xl font-bold text-primary-400">
                {dynamicStats ? `${dynamicStats.total_companies.toLocaleString()}+` : '2,100+'}
              </div>
              <div className="text-sm text-metallic-400">Companies Tracked</div>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700/50">
              <div className="text-2xl font-bold text-primary-400">
                {dynamicStats ? Object.keys(dynamicStats.by_exchange || {}).length : 7}
              </div>
              <div className="text-sm text-metallic-400">Exchanges</div>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700/50">
              <div className="text-2xl font-bold text-primary-400">
                {dynamicStats ? `${dynamicStats.total_countries}+` : '50+'}
              </div>
              <div className="text-sm text-metallic-400">Countries</div>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700/50">
              <div className="text-2xl font-bold text-primary-400">24/7</div>
              <div className="text-sm text-metallic-400">Data Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Three Main Modals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Modal 1: Global Spatial View */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-colors group">
            <Link href="/analysis/global" className="block">
              <div className="p-6 border-b border-metallic-800 bg-gradient-to-br from-indigo-500/10 to-purple-600/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-xs font-medium rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                    LIVE
                  </span>
                </div>
                <h2 className="text-xl font-bold text-metallic-100 group-hover:text-primary-400 transition-colors">
                  Global Spatial View
                </h2>
                <p className="text-metallic-400 mt-2 text-sm">
                  Interactive map with {dynamicStats ? dynamicStats.total_companies.toLocaleString() : '2,100'}+ mining companies across all major exchanges. Filter by country, commodity, or exchange with real-time zoom and geoscience data overlays.
                </p>
              </div>
            </Link>
            
            <div className="p-4 space-y-2">
              {spatialCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-metallic-800/70 transition-colors group/item"
                >
                  <div className="w-9 h-9 rounded-lg bg-metallic-800 flex items-center justify-center group-hover/item:bg-primary-500/20 transition-colors">
                    <cat.icon className="w-4 h-4 text-metallic-400 group-hover/item:text-primary-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-metallic-200 group-hover/item:text-primary-400 transition-colors">
                      {cat.title}
                    </div>
                    <div className="text-xs text-metallic-500">{cat.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-metallic-600 group-hover/item:text-primary-400 group-hover/item:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            
            <div className="p-4 pt-0">
              <Link
                href="/analysis/global"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                <MapPin className="w-4 h-4" />
                Open Interactive Map
              </Link>
            </div>
          </div>

          {/* Modal 2: Mining Analytics */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-colors group">
            <Link href="/analysis/mining-analytics" className="block">
              <div className="p-6 border-b border-metallic-800 bg-gradient-to-br from-cyan-500/10 to-blue-600/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
                    ANALYTICS
                  </span>
                </div>
                <h2 className="text-xl font-bold text-metallic-100 group-hover:text-cyan-400 transition-colors">
                  Mining Analytics
                </h2>
                <p className="text-metallic-400 mt-2 text-sm">
                  Comprehensive analysis tools including market data, announcements, peer comparison, exploration data, and project stage filtering.
                </p>
              </div>
            </Link>
            
            <div className="p-4 space-y-2">
              {analyticsCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-metallic-800/70 transition-colors group/item"
                >
                  <div className="w-9 h-9 rounded-lg bg-metallic-800 flex items-center justify-center group-hover/item:bg-cyan-500/20 transition-colors">
                    <cat.icon className="w-4 h-4 text-metallic-400 group-hover/item:text-cyan-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-metallic-200 group-hover/item:text-cyan-400 transition-colors">
                      {cat.title}
                    </div>
                    <div className="text-xs text-metallic-500">{cat.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-metallic-600 group-hover/item:text-cyan-400 group-hover/item:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            
            <div className="p-4 pt-0">
              <Link
                href="/analysis/mining-analytics"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Open Analytics Dashboard
              </Link>
            </div>
          </div>

          {/* Modal 3: AI Research Analyst */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-colors">
            <div className="p-6 border-b border-metallic-800 bg-gradient-to-br from-emerald-500/10 to-teal-600/10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Powered by AI
                </span>
              </div>
              <h2 className="text-xl font-bold text-metallic-100">
                Your AI Research Analyst
              </h2>
              <p className="text-metallic-400 mt-2 text-sm">
                While competitors give you raw data, InvestOre interprets it for you. Our AI reads every announcement, flags opportunities, and explains why stocks are mispriced.
              </p>
            </div>
            
            <div className="p-4 space-y-3">
              {aiFeatures.slice(0, 3).map((feature) => (
                <div
                  key={feature.id}
                  className="p-3 rounded-lg bg-metallic-800/30 border border-metallic-700/50 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className={`w-4 h-4 ${feature.iconColor || 'text-emerald-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-metallic-100">{feature.title}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${feature.badgeColor}`}>
                          {feature.badge}
                        </span>
                      </div>
                      <p className="text-xs text-metallic-400 line-clamp-2">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Second row of AI features */}
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {aiFeatures.slice(3).map((feature) => (
                <div
                  key={feature.id}
                  className="p-2.5 rounded-lg bg-metallic-800/30 border border-metallic-700/50 hover:border-emerald-500/30 transition-colors text-center"
                >
                  <feature.icon className={`w-5 h-5 mx-auto mb-1.5 ${feature.iconColor || 'text-emerald-400'}`} />
                  <div className="text-[10px] font-medium text-metallic-200 leading-tight">{feature.title}</div>
                </div>
              ))}
            </div>
            
            <div className="p-4 pt-0">
              <button
                disabled
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500/50 to-teal-600/50 text-white/70 font-medium rounded-lg cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Coming Soon
              </button>
              <p className="text-xs text-metallic-500 text-center mt-2">
                AI features launching Q1 2026
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Recent Activity & Search */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Announcements */}
          <div className="lg:col-span-2 bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-metallic-100">Recent Announcements</h3>
              <Link href="/analysis/announcements" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { company: 'NEM.ASX', title: 'Quarterly Production Report Released', time: '2 hours ago', type: 'Production' },
                { company: 'BHP.ASX', title: 'Resource Update - Olympic Dam', time: '4 hours ago', type: 'Resource' },
                { company: 'RIO.ASX', title: 'Exploration Drilling Results - Pilbara', time: '6 hours ago', type: 'Drilling' },
                { company: 'FMG.ASX', title: 'Q3 Shipments Above Guidance', time: '8 hours ago', type: 'Production' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-metallic-800/50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-metallic-800 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-metallic-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-primary-400">{item.company}</span>
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-metallic-700 text-metallic-300 rounded">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-metallic-200 truncate">{item.title}</p>
                  </div>
                  <div className="text-xs text-metallic-500 flex-shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Search & Actions */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-metallic-100 mb-4">Quick Search</h3>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-metallic-500" />
              <input
                type="text"
                placeholder="Search companies, commodities..."
                className="w-full pl-10 pr-4 py-3 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-metallic-500 uppercase tracking-wider mb-3">Popular Searches</p>
              {[
                { label: 'Gold Producers', href: '/analysis/global?commodity=Gold&type=producer' },
                { label: 'Lithium Explorers', href: '/analysis/global?commodity=Lithium' },
                { label: 'Canadian Copper', href: '/analysis/global?country=Canada&commodity=Copper' },
                { label: 'ASX Small Caps', href: '/analysis/exchanges?exchange=ASX&cap=small' },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-metallic-800/70 transition-colors group"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-500/50 group-hover:bg-primary-500 transition-colors" />
                  <span className="text-sm text-metallic-300 group-hover:text-metallic-100 transition-colors">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
