'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Mountain, MapPin, Drill, FileText, TrendingUp, 
  ExternalLink, Loader2, AlertCircle, ChevronRight,
  Gem, Building2, Calendar
} from 'lucide-react';
import { useCompanyIntelligence, CompanyIntelligence } from '@/hooks/useCompanyIntelligence';
import { getCommodityColor } from '@/lib/subscription-tiers';

interface CompanyGeoscienceWidgetProps {
  symbol: string;
  showFullDetails?: boolean;
}

// Format confidence
function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

// Get confidence color
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-400';
  if (confidence >= 0.6) return 'text-yellow-400';
  return 'text-orange-400';
}

export default function CompanyGeoscienceWidget({ 
  symbol, 
  showFullDetails = false 
}: CompanyGeoscienceWidgetProps) {
  const { intelligence, isLoading, error, refresh } = useCompanyIntelligence(symbol);

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <span className="ml-2 text-slate-400">Loading geoscience intelligence...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <div className="flex items-center justify-center py-8 text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!intelligence) {
    return null;
  }

  const totalLinkedAssets = 
    intelligence.operating_mines.length + 
    intelligence.deposits.length + 
    intelligence.critical_minerals.length;

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Geoscience Intelligence</h3>
              <p className="text-sm text-slate-400">
                Data linked from Geoscience Australia
              </p>
            </div>
          </div>
          <Link
            href="/analysis/geoscience"
            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-slate-800">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {intelligence.operating_mines.length}
          </div>
          <div className="text-xs text-slate-400">Operating Mines</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {intelligence.deposits.length}
          </div>
          <div className="text-xs text-slate-400">Known Deposits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {intelligence.resources.length}
          </div>
          <div className="text-xs text-slate-400">Resource Estimates</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {intelligence.recent_drilling.length}
          </div>
          <div className="text-xs text-slate-400">Drilling Results</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Operating Mines */}
        {intelligence.operating_mines.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Drill className="w-4 h-4" />
              Linked Operating Mines ({intelligence.operating_mines.length})
            </h4>
            <div className="space-y-2">
              {intelligence.operating_mines.slice(0, showFullDetails ? 10 : 3).map((mine, index) => (
                <div 
                  key={`${mine.ga_id}-${index}`}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mountain className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-white font-medium">{mine.ga_name}</div>
                      <div className="text-xs text-slate-400">
                        {mine.state} • Match: <span className={getConfidenceColor(mine.match_confidence)}>
                          {formatConfidence(mine.match_confidence)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: `${getCommodityColor(mine.commodity)}20`,
                        color: getCommodityColor(mine.commodity)
                      }}
                    >
                      {mine.commodity || 'N/A'}
                    </span>
                    <a
                      href={`https://www.google.com/maps/@${mine.lat},${mine.lng},12z`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-white"
                      title="View on map"
                    >
                      <MapPin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
              {!showFullDetails && intelligence.operating_mines.length > 3 && (
                <div className="text-center text-sm text-slate-400 pt-2">
                  +{intelligence.operating_mines.length - 3} more mines
                </div>
              )}
            </div>
          </div>
        )}

        {/* Critical Minerals */}
        {intelligence.critical_minerals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Gem className="w-4 h-4" />
              Critical Mineral Assets ({intelligence.critical_minerals.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {intelligence.critical_minerals.slice(0, showFullDetails ? 10 : 5).map((mineral, index) => (
                <div 
                  key={`${mineral.ga_id}-${index}`}
                  className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                >
                  <div className="text-white text-sm font-medium">{mineral.ga_name}</div>
                  <div className="text-xs text-purple-400">{mineral.commodity}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resource Estimates */}
        {intelligence.resources.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Resource Estimates from Announcements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {intelligence.resources.slice(0, showFullDetails ? 6 : 2).map((resource, index) => (
                <div 
                  key={index}
                  className="p-3 bg-slate-800/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase">{resource.category}</span>
                    <span 
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ 
                        backgroundColor: `${getCommodityColor(resource.commodity)}20`,
                        color: getCommodityColor(resource.commodity)
                      }}
                    >
                      {resource.commodity}
                    </span>
                  </div>
                  <div className="text-white font-bold">
                    {resource.tonnage_mt.toFixed(1)} Mt @ {resource.grade} {resource.grade_unit}
                  </div>
                  {resource.contained_metal && (
                    <div className="text-sm text-slate-400 mt-1">
                      {resource.contained_metal.toFixed(1)} {resource.contained_unit} contained
                    </div>
                  )}
                  {resource.effective_date && (
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {resource.effective_date}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Announcements */}
        {(intelligence.resource_announcements.length > 0 || 
          intelligence.drilling_announcements.length > 0) && (
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Recent Mining Announcements
            </h4>
            <div className="space-y-2">
              {[...intelligence.resource_announcements, ...intelligence.drilling_announcements]
                .slice(0, showFullDetails ? 10 : 3)
                .map((ann, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="flex-1 mr-4">
                      <div className="text-white text-sm line-clamp-1">
                        {ann.header || ann.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {ann.document_date?.slice(0, 10)}
                      </div>
                    </div>
                    {ann.url && (
                      <a
                        href={ann.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {totalLinkedAssets === 0 && intelligence.resources.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Mountain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No geoscience data linked to this company yet.</p>
            <p className="text-sm mt-2">
              Check back as we expand our data coverage.
            </p>
          </div>
        )}

        {/* Total Resources Summary */}
        {intelligence.total_resources_mt > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Resources</span>
              <span className="text-white font-bold text-lg">
                {intelligence.total_resources_mt.toFixed(1)} Mt
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-800 bg-slate-800/30">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Last updated: {new Date(intelligence.last_updated).toLocaleDateString()}</span>
          <span>Source: Geoscience Australia + ASX Announcements</span>
        </div>
      </div>
    </div>
  );
}
