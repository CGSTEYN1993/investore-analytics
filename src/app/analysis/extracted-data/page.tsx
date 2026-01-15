'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Database, 
  MapPin, 
  Layers, 
  TrendingUp, 
  ArrowRight,
  Drill,
  Building2
} from 'lucide-react';
import miningDataService, { ExtractionStats } from '@/services/miningData';

export default function ExtractedDataOverviewPage() {
  const [stats, setStats] = useState<ExtractionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await miningDataService.getExtractionStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const integrationLinks = [
    {
      title: 'Exploration Data',
      description: 'Browse drilling programs, assay results, and exploration surveys',
      href: '/analysis/exploration',
      icon: Drill,
      color: 'bg-red-500',
      stats: stats ? `${stats.drilling_results.toLocaleString()} drill holes` : 'Loading...',
    },
    {
      title: 'Project Stages',
      description: 'View projects by development phase from exploration to production',
      href: '/analysis/stages',
      icon: Layers,
      color: 'bg-blue-500',
      stats: stats ? `${stats.projects_extracted.toLocaleString()} projects` : 'Loading...',
    },
    {
      title: 'Resources & Reserves',
      description: 'Explore resource estimates and ore reserve data by commodity',
      href: '/analysis/commodities',
      icon: Database,
      color: 'bg-purple-500',
      stats: stats ? `${stats.resources_extracted.toLocaleString()} estimates` : 'Loading...',
    },
    {
      title: 'Company Profiles',
      description: 'View integrated mining data on individual company pages',
      href: '/analysis',
      icon: Building2,
      color: 'bg-green-500',
      stats: stats ? `${stats.total_documents.toLocaleString()} documents processed` : 'Loading...',
    },
  ];

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="border-b border-metallic-800 bg-metallic-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/analysis"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-metallic-100 flex items-center gap-3">
              AI-Extracted Mining Data
              <span className="text-xs font-normal bg-accent-gold/20 text-accent-gold px-2 py-1 rounded">
                Integrated
              </span>
            </h1>
            <p className="text-metallic-400 text-sm mt-1">
              Mining data automatically extracted from ASX announcements is now integrated throughout the platform
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-metallic-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-gold" />
            Extraction Pipeline Statistics
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-metallic-800/50 rounded-lg p-4 animate-pulse">
                  <div className="h-8 w-20 bg-metallic-700 rounded mb-2" />
                  <div className="h-4 w-32 bg-metallic-700 rounded" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-metallic-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-metallic-100">
                  {stats.total_documents.toLocaleString()}
                </div>
                <div className="text-sm text-metallic-400">Documents Processed</div>
              </div>
              <div className="bg-metallic-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-metallic-100">
                  {stats.projects_extracted.toLocaleString()}
                </div>
                <div className="text-sm text-metallic-400">Projects Identified</div>
              </div>
              <div className="bg-metallic-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-metallic-100">
                  {stats.resources_extracted.toLocaleString()}
                </div>
                <div className="text-sm text-metallic-400">Resource Estimates</div>
              </div>
              <div className="bg-metallic-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-metallic-100">
                  {stats.drilling_results.toLocaleString()}
                </div>
                <div className="text-sm text-metallic-400">Drilling Results</div>
              </div>
            </div>
          ) : (
            <p className="text-metallic-400">Failed to load statistics</p>
          )}
        </div>

        {/* Integration Links */}
        <h2 className="text-lg font-semibold text-metallic-100 mb-4">
          Where to Find Extracted Data
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {integrationLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:border-accent-gold/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`${link.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-metallic-100 group-hover:text-accent-gold transition-colors">
                        {link.title}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-metallic-500 group-hover:text-accent-gold group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-metallic-400 mt-1">{link.description}</p>
                    <p className="text-xs text-metallic-500 mt-2">{link.stats}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-6">
          <h3 className="font-semibold text-accent-gold mb-2">About AI-Extracted Data</h3>
          <p className="text-sm text-metallic-300">
            We automatically process ASX announcements using advanced AI to extract key mining data including 
            resource estimates, drilling results, project phases, and economic metrics. This data is now 
            seamlessly integrated into the relevant sections of the platform rather than being siloed 
            in a separate dashboard.
          </p>
          <p className="text-sm text-metallic-400 mt-2">
            Visit company profile pages to see extracted data specific to each company, or use the 
            exploration and stages pages to browse data across all companies.
          </p>
        </div>
      </div>
    </div>
  );
}
