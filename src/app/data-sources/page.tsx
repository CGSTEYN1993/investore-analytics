'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, Globe, FileText, BarChart3, Map } from 'lucide-react';

const dataSources = [
  {
    name: 'ASX (Australian Securities Exchange)',
    icon: Globe,
    description: 'Real-time and historical market data for Australian mining and exploration companies.',
    dataTypes: ['Stock prices', 'Market caps', 'Company announcements', 'Corporate actions'],
    updateFrequency: 'Real-time / Daily',
  },
  {
    name: 'TSX/TSXV (Toronto Stock Exchange)',
    icon: Globe,
    description: 'Canadian mining company data including junior explorers on the Venture Exchange.',
    dataTypes: ['Stock prices', 'Market data', 'Filings'],
    updateFrequency: 'Daily',
  },
  {
    name: 'Geoscience Australia',
    icon: Map,
    description: 'Official geological survey data including mineral deposits, operating mines, and drill hole databases.',
    dataTypes: ['Operating mines', 'Mineral deposits', 'Critical minerals', 'Geological provinces'],
    updateFrequency: 'Quarterly',
  },
  {
    name: 'Company Announcements',
    icon: FileText,
    description: 'Automated extraction of technical data from company announcements and reports.',
    dataTypes: ['Drilling results', 'Resource estimates', 'Economic studies', 'Exploration updates'],
    updateFrequency: 'As released',
  },
  {
    name: 'Commodity Prices',
    icon: BarChart3,
    description: 'Spot and futures prices for metals and minerals from major exchanges.',
    dataTypes: ['Precious metals', 'Base metals', 'Battery metals', 'Bulk commodities'],
    updateFrequency: 'Real-time',
  },
];

export default function DataSourcesPage() {
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
          <Database className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold text-metallic-100">Data Sources</h1>
        </div>
        
        <p className="text-metallic-400 mb-12 max-w-2xl">
          InvestOre Analytics aggregates data from multiple authoritative sources to provide 
          comprehensive mining and exploration company analysis.
        </p>

        <div className="space-y-6">
          {dataSources.map((source) => (
            <div
              key={source.name}
              className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <source.icon className="w-8 h-8 text-primary-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-metallic-100">{source.name}</h3>
                    <span className="text-xs px-2 py-1 bg-metallic-800 text-metallic-400 rounded">
                      {source.updateFrequency}
                    </span>
                  </div>
                  <p className="text-metallic-400 text-sm mb-4">{source.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {source.dataTypes.map((type) => (
                      <span
                        key={type}
                        className="text-xs px-2 py-1 bg-primary-500/10 text-primary-400 rounded border border-primary-500/20"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <h3 className="font-semibold text-amber-400 mb-2">Data Disclaimer</h3>
          <p className="text-metallic-400 text-sm">
            All data is provided for informational purposes only. While we strive for accuracy, 
            users should verify critical information with primary sources. Data may be delayed 
            and is subject to the terms of our data providers.
          </p>
        </div>
      </div>
    </div>
  );
}
