'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Sparkles, Map, Users, BarChart3, Database, 
  Brain, LineChart, Globe, FileText, Zap
} from 'lucide-react';

const features = [
  {
    title: 'AI Analyst',
    icon: Brain,
    description: 'Natural language queries powered by AI to analyze mining data, detect risks, and compare companies.',
    status: 'live',
    href: '/analysis/ai-analyst',
  },
  {
    title: 'Interactive Project Map',
    icon: Map,
    description: 'Explore mining projects globally with rich geological overlays and company data.',
    status: 'live',
    href: '/analysis/map',
  },
  {
    title: 'Peer Group Builder',
    icon: Users,
    description: 'Create and save custom peer groups for comparative valuation analysis.',
    status: 'live',
    href: '/peers',
  },
  {
    title: 'Valuation Analytics',
    icon: BarChart3,
    description: 'EV/resource, P/NAV, market cap per ounce, and other key valuation metrics.',
    status: 'live',
    href: '/analysis/market',
  },
  {
    title: 'Multi-Exchange Data',
    icon: Globe,
    description: 'Coverage across ASX, TSX, LSE, NYSE, JSE, and other major mining exchanges.',
    status: 'live',
    href: '/analysis/exchanges',
  },
  {
    title: 'Announcement Extraction',
    icon: FileText,
    description: 'Automated extraction of drilling results, resources, and economic metrics from company announcements.',
    status: 'live',
    href: '/analysis/extracted-data',
  },
  {
    title: 'Real-time Market Data',
    icon: LineChart,
    description: 'Live stock quotes, commodity prices, and market analytics.',
    status: 'live',
    href: '/analysis/prices/charts',
  },
  {
    title: 'Geoscience Integration',
    icon: Database,
    description: 'Linked data from Geoscience Australia and other geological surveys.',
    status: 'live',
    href: '/analysis/geoscience',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-metallic-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-metallic-400 hover:text-primary-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold text-metallic-100">Features</h1>
        </div>
        
        <p className="text-metallic-400 mb-12 max-w-2xl">
          Powerful tools for mining and exploration company analysis, built for professional investors and analysts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6 hover:bg-metallic-800/50 hover:border-primary-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <feature.icon className="w-8 h-8 text-primary-400 group-hover:scale-110 transition-transform" />
                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                  {feature.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-metallic-100 mb-2">{feature.title}</h3>
              <p className="text-metallic-400 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Zap className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-metallic-100 mb-4">More Features Coming Soon</h2>
          <p className="text-metallic-400 max-w-xl mx-auto">
            We are continuously adding new features and data sources. Stay tuned for portfolio tracking, 
            advanced screening, and machine learning models.
          </p>
        </div>
      </div>
    </div>
  );
}
