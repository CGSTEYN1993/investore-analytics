"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Drill,
  Mountain,
  Droplets,
  Waves,
  MapPin,
  Calendar,
  Layers,
  Download,
  ArrowLeft,
  Building2,
  ChevronDown,
  Target,
  Ruler,
  Gem,
  X,
  FolderOpen,
  Globe,
} from "lucide-react";
import miningDataService, { 
  ExplorationDrilling, 
  DrillIntercept,
  ExplorationSummary,
} from "@/services/miningData";

// Exploration data types
const explorationTypes = [
  { id: "drilling", name: "Drilling", icon: Drill, color: "bg-red-500" },
  { id: "intercepts", name: "Intercepts", icon: Target, color: "bg-amber-500" },
  { id: "rocks", name: "Rocks", icon: Mountain, color: "bg-purple-500" },
  { id: "soils", name: "Soils", icon: Droplets, color: "bg-green-500" },
  { id: "streams", name: "Streams", icon: Waves, color: "bg-blue-500" },
];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    Completed: "bg-green-500/20 text-green-400 border-green-500/30",
    "In Progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Planned: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full border ${colors[status] || "bg-gray-500/20 text-gray-400"}`}
    >
      {status}
    </span>
  );
};

// Drilling card component using API data
const DrillingCard = ({ hole }: { hole: ExplorationDrilling }) => (
  <div className="bg-metallic-800/50 rounded-lg border border-metallic-700 p-4 hover:border-red-500/50 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-metallic-100">{hole.hole_id}</h3>
        <Link 
          href={`/company/${hole.symbol}`}
          className="text-sm text-accent-gold hover:underline"
        >
          {hole.symbol}
        </Link>
        {hole.project_name && (
          <p className="text-sm text-metallic-400">{hole.project_name}</p>
        )}
      </div>
      <StatusBadge status={hole.status} />
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
      {hole.drill_type && (
        <div className="flex items-center gap-1 text-metallic-400">
          <Layers className="w-3 h-3" />
          <span>{hole.drill_type}</span>
        </div>
      )}
      {hole.total_depth && (
        <div className="flex items-center gap-1 text-metallic-400">
          <Ruler className="w-3 h-3" />
          <span>{hole.total_depth.toFixed(0)}m depth</span>
        </div>
      )}
      {hole.announcement_date && (
        <div className="flex items-center gap-1 text-metallic-400">
          <Calendar className="w-3 h-3" />
          <span>{new Date(hole.announcement_date).toLocaleDateString()}</span>
        </div>
      )}
      {(hole.easting || hole.northing) && (
        <div className="flex items-center gap-1 text-metallic-400">
          <MapPin className="w-3 h-3" />
          <span>
            {hole.easting?.toFixed(0) || '?'}E, {hole.northing?.toFixed(0) || '?'}N
          </span>
        </div>
      )}
    </div>
    {(hole.azimuth || hole.dip) && (
      <div className="flex flex-wrap gap-1">
        {hole.azimuth && (
          <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
            Az: {hole.azimuth}°
          </span>
        )}
        {hole.dip && (
          <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
            Dip: {hole.dip}°
          </span>
        )}
      </div>
    )}
  </div>
);

// Intercept card component
const InterceptCard = ({ intercept }: { intercept: DrillIntercept }) => (
  <div className="bg-metallic-800/50 rounded-lg border border-metallic-700 p-4 hover:border-amber-500/50 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-metallic-100">{intercept.hole_id}</h3>
        <Link 
          href={`/company/${intercept.symbol}`}
          className="text-sm text-accent-gold hover:underline"
        >
          {intercept.symbol}
        </Link>
      </div>
      {intercept.commodity && (
        <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
          {intercept.commodity}
        </span>
      )}
    </div>
    
    {/* Grade highlight */}
    {intercept.grade && (
      <div className="bg-metallic-900/50 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-metallic-400 text-sm">Grade</span>
          <span className="text-xl font-bold text-accent-gold">
            {intercept.grade.toFixed(2)} {intercept.grade_unit || 'g/t'}
          </span>
        </div>
      </div>
    )}
    
    <div className="grid grid-cols-2 gap-2 text-sm">
      {intercept.width_m && (
        <div className="flex items-center gap-1 text-metallic-400">
          <Ruler className="w-3 h-3" />
          <span>{intercept.width_m.toFixed(1)}m width</span>
        </div>
      )}
      {(intercept.from_m !== null && intercept.to_m !== null) && (
        <div className="flex items-center gap-1 text-metallic-400">
          <Layers className="w-3 h-3" />
          <span>{intercept.from_m?.toFixed(0)}-{intercept.to_m?.toFixed(0)}m</span>
        </div>
      )}
      {intercept.announcement_date && (
        <div className="flex items-center gap-1 text-metallic-400">
          <Calendar className="w-3 h-3" />
          <span>{new Date(intercept.announcement_date).toLocaleDateString()}</span>
        </div>
      )}
    </div>
    
    {/* Grade-meter product */}
    {intercept.grade && intercept.width_m && (
      <div className="mt-3 pt-3 border-t border-metallic-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-metallic-500">Grade × Width</span>
          <span className="text-metallic-300 font-medium">
            {(intercept.grade * intercept.width_m).toFixed(1)} {intercept.grade_unit || 'g/t'}·m
          </span>
        </div>
      </div>
    )}
  </div>
);

// Loading skeleton
const DrillingCardSkeleton = () => (
  <div className="bg-metallic-800/50 rounded-lg border border-metallic-700 p-4 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-metallic-700 rounded" />
        <div className="h-3 w-16 bg-metallic-700 rounded" />
      </div>
      <div className="h-5 w-20 bg-metallic-700 rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="h-4 bg-metallic-700 rounded" />
      <div className="h-4 bg-metallic-700 rounded" />
      <div className="h-4 bg-metallic-700 rounded" />
      <div className="h-4 bg-metallic-700 rounded" />
    </div>
  </div>
);

// Coming soon placeholder for other data types
const ComingSoonCard = ({ type }: { type: string }) => (
  <div className="bg-metallic-800/30 rounded-lg border border-dashed border-metallic-600 p-8 text-center">
    <p className="text-metallic-400 text-lg mb-2">
      {type} data extraction coming soon
    </p>
    <p className="text-metallic-500 text-sm">
      We&apos;re currently extracting drilling data from ASX announcements.
      Rock, soil, and stream sediment data will be available in future updates.
    </p>
  </div>
);

// Summary stats card
const SummaryStatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtext 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
  subtext?: string;
}) => (
  <div className="bg-metallic-800/50 rounded-lg border border-metallic-700 p-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-accent-gold/20 rounded-lg">
        <Icon className="w-5 h-5 text-accent-gold" />
      </div>
      <div>
        <p className="text-2xl font-bold text-metallic-100">{value}</p>
        <p className="text-sm text-metallic-400">{label}</p>
        {subtext && <p className="text-xs text-metallic-500">{subtext}</p>}
      </div>
    </div>
  </div>
);

// Active filter badge
const FilterBadge = ({ label, onClear }: { label: string; onClear: () => void }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-gold/20 text-accent-gold text-xs rounded-full">
    {label}
    <button onClick={onClear} className="hover:text-white">
      <X className="w-3 h-3" />
    </button>
  </span>
);

export default function ExplorationPage() {
  const [activeType, setActiveType] = useState("drilling");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Summary data
  const [summary, setSummary] = useState<ExplorationSummary | null>(null);
  
  // Drilling data
  const [drillingData, setDrillingData] = useState<ExplorationDrilling[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [totalDrilling, setTotalDrilling] = useState(0);
  
  // Intercepts data
  const [interceptsData, setInterceptsData] = useState<DrillIntercept[]>([]);
  const [interceptCompanies, setInterceptCompanies] = useState<string[]>([]);
  const [interceptCommodities, setInterceptCommodities] = useState<string[]>([]);
  const [interceptExchanges, setInterceptExchanges] = useState<string[]>([]);
  const [totalIntercepts, setTotalIntercepts] = useState(0);
  
  // Drilling Filters
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDrillType, setSelectedDrillType] = useState<string>("");
  const [selectedExchange, setSelectedExchange] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  // Intercept Filters
  const [selectedInterceptCompany, setSelectedInterceptCompany] = useState<string>("");
  const [selectedCommodity, setSelectedCommodity] = useState<string>("");
  const [selectedInterceptExchange, setSelectedInterceptExchange] = useState<string>("");
  const [minGrade, setMinGrade] = useState<number | undefined>(undefined);
  const [interceptDateFrom, setInterceptDateFrom] = useState<string>("");
  const [interceptDateTo, setInterceptDateTo] = useState<string>("");

  // Fetch summary on mount
  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await miningDataService.getExplorationSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch exploration summary:", err);
      }
    }
    fetchSummary();
  }, []);

  // Fetch drilling data
  useEffect(() => {
    async function fetchDrillingData() {
      if (activeType !== "drilling") return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await miningDataService.getExplorationDrilling({
          symbol: selectedCompany || undefined,
          project: selectedProject || undefined,
          drillType: selectedDrillType || undefined,
          exchange: selectedExchange || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          limit: 100,
        });
        
        setDrillingData(response.drilling);
        setCompanies(response.companies);
        setProjects(response.projects || []);
        setExchanges(response.exchanges || []);
        setTotalDrilling(response.total);
      } catch (err) {
        console.error("Failed to fetch drilling data:", err);
        setError("Failed to load drilling data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDrillingData();
  }, [activeType, selectedCompany, selectedProject, selectedDrillType, selectedExchange, dateFrom, dateTo]);

  // Fetch intercepts data
  useEffect(() => {
    async function fetchInterceptsData() {
      if (activeType !== "intercepts") return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await miningDataService.getDrillIntercepts({
          symbol: selectedInterceptCompany || undefined,
          commodity: selectedCommodity || undefined,
          exchange: selectedInterceptExchange || undefined,
          minGrade: minGrade,
          dateFrom: interceptDateFrom || undefined,
          dateTo: interceptDateTo || undefined,
          limit: 100,
        });
        
        setInterceptsData(response.intercepts);
        setInterceptCompanies(response.companies);
        setInterceptCommodities(response.commodities);
        setInterceptExchanges(response.exchanges || []);
        setTotalIntercepts(response.total);
      } catch (err) {
        console.error("Failed to fetch intercepts data:", err);
        setError("Failed to load intercepts data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchInterceptsData();
  }, [activeType, selectedInterceptCompany, selectedCommodity, selectedInterceptExchange, minGrade, interceptDateFrom, interceptDateTo]);

  // Calculate stats from real data
  const stats = {
    drilling: { 
      count: totalDrilling, 
      meters: drillingData.reduce((sum, d) => sum + (d.total_depth || 0), 0),
      companies: companies.length
    },
    intercepts: {
      count: totalIntercepts,
      companies: interceptCompanies.length,
      commodities: interceptCommodities.length
    },
  };

  // Check if any drilling filters are active
  const hasDrillingFilters = selectedCompany || selectedProject || selectedDrillType || selectedExchange || dateFrom || dateTo;
  const hasInterceptFilters = selectedInterceptCompany || selectedCommodity || selectedInterceptExchange || minGrade || interceptDateFrom || interceptDateTo;

  const clearAllDrillingFilters = () => {
    setSelectedCompany("");
    setSelectedProject("");
    setSelectedDrillType("");
    setSelectedExchange("");
    setDateFrom("");
    setDateTo("");
  };

  const clearAllInterceptFilters = () => {
    setSelectedInterceptCompany("");
    setSelectedCommodity("");
    setSelectedInterceptExchange("");
    setMinGrade(undefined);
    setInterceptDateFrom("");
    setInterceptDateTo("");
  };

  const renderContent = () => {
    switch (activeType) {
      case "drilling":
        if (loading) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <DrillingCardSkeleton key={i} />
              ))}
            </div>
          );
        }
        
        if (error) {
          return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => setActiveType("drilling")}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400"
              >
                Retry
              </button>
            </div>
          );
        }
        
        if (drillingData.length === 0) {
          return (
            <div className="bg-metallic-800/30 rounded-lg border border-dashed border-metallic-600 p-8 text-center">
              <p className="text-metallic-400 text-lg mb-2">No drilling data found</p>
              <p className="text-metallic-500 text-sm">
                {hasDrillingFilters ? 'Try adjusting your filters' : 'No drilling data available'}
              </p>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drillingData.map((hole) => (
              <DrillingCard key={`${hole.symbol}-${hole.hole_id}-${hole.id}`} hole={hole} />
            ))}
          </div>
        );
        
      case "intercepts":
        if (loading) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <DrillingCardSkeleton key={i} />
              ))}
            </div>
          );
        }
        
        if (error) {
          return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setActiveType("intercepts");
                }}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400"
              >
                Retry
              </button>
            </div>
          );
        }
        
        if (interceptsData.length === 0) {
          return (
            <div className="bg-metallic-800/30 rounded-lg border border-dashed border-metallic-600 p-8 text-center">
              <p className="text-metallic-400 text-lg mb-2">No intercepts found</p>
              <p className="text-metallic-500 text-sm">
                {hasInterceptFilters ? 'Try adjusting your filters' : 'No intercepts data available'}
              </p>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interceptsData.map((intercept) => (
              <InterceptCard key={`${intercept.symbol}-${intercept.hole_id}-${intercept.id}`} intercept={intercept} />
            ))}
          </div>
        );
        
      case "rocks":
      case "soils":
      case "streams":
        return <ComingSoonCard type={explorationTypes.find(t => t.id === activeType)?.name || activeType} />;
        
      default:
        return null;
    }
  };

  const getActiveTypeData = () => {
    switch (activeType) {
      case "drilling":
        return {
          title: "Drilling Programs",
          subtitle: loading 
            ? "Loading..."
            : `${stats.drilling.count.toLocaleString()} holes • ${stats.drilling.meters.toLocaleString()}m total • ${stats.drilling.companies} companies`,
        };
      case "intercepts":
        return {
          title: "Significant Intercepts",
          subtitle: loading
            ? "Loading..."
            : `${stats.intercepts.count.toLocaleString()} intercepts • ${stats.intercepts.companies} companies • ${stats.intercepts.commodities} commodities`,
        };
      case "rocks":
        return { title: "Rock Samples", subtitle: "Coming soon" };
      case "soils":
        return { title: "Soil Surveys", subtitle: "Coming soon" };
      case "streams":
        return { title: "Stream Sediments", subtitle: "Coming soon" };
      default:
        return { title: "", subtitle: "" };
    }
  };

  const activeData = getActiveTypeData();

  return (
    <div className="min-h-screen bg-metallic-950 text-metallic-100">
      {/* Header */}
      <div className="border-b border-metallic-800 bg-metallic-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/analysis"
            className="inline-flex items-center gap-2 text-metallic-400 hover:text-metallic-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Analysis</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-metallic-100">
                Exploration Data
              </h1>
              <p className="text-metallic-400 text-sm mt-1">
                Browse drilling programs, intercepts, and geochemical results extracted from ASX announcements
              </p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-metallic-700 text-metallic-400 hover:border-metallic-500 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <SummaryStatCard
              icon={Drill}
              label="Total Holes"
              value={summary.total_holes.toLocaleString()}
              subtext={`Avg: ${summary.avg_hole_depth.toFixed(0)}m`}
            />
            <SummaryStatCard
              icon={Ruler}
              label="Total Meters"
              value={`${(summary.total_meters / 1000).toFixed(1)}km`}
              subtext={`Deepest: ${summary.deepest_hole.toFixed(0)}m`}
            />
            <SummaryStatCard
              icon={Target}
              label="Intercepts"
              value={summary.total_intercepts.toLocaleString()}
            />
            <SummaryStatCard
              icon={Building2}
              label="Companies"
              value={summary.companies_with_drilling}
              subtext={summary.commodities_found.slice(0, 3).join(", ")}
            />
          </div>
        )}

        {/* Exploration Type Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {explorationTypes.map((type) => {
            const Icon = type.icon;
            const isActive = activeType === type.id;
            const count = type.id === "drilling" 
              ? stats.drilling.count 
              : type.id === "intercepts" 
                ? stats.intercepts.count 
                : 0;
            return (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border whitespace-nowrap transition-all ${
                  isActive
                    ? `${type.color} border-transparent text-white`
                    : "bg-metallic-800/50 border-metallic-700 text-metallic-400 hover:text-metallic-100 hover:border-metallic-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.name}</span>
                {(type.id === "drilling" || type.id === "intercepts") && !loading && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-metallic-700 text-metallic-400"
                    }`}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Fixed Filters Panel - Drilling */}
        {activeType === "drilling" && (
          <div className="bg-metallic-800/50 rounded-lg border border-metallic-700 p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Company Filter */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  Company
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-8 py-2 text-sm text-metallic-100 appearance-none focus:border-accent-gold focus:outline-none"
                  >
                    <option value="">All Companies</option>
                    {companies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
                </div>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  Project
                </label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-8 py-2 text-sm text-metallic-100 appearance-none focus:border-accent-gold focus:outline-none"
                  >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                      <option key={project} value={project}>
                        {project}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
                </div>
              </div>

              {/* Drill Type Filter */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  Drill Type
                </label>
                <div className="relative">
                  <Drill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <select
                    value={selectedDrillType}
                    onChange={(e) => setSelectedDrillType(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-8 py-2 text-sm text-metallic-100 appearance-none focus:border-accent-gold focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="RC">RC</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Air Core">Air Core</option>
                    <option value="RAB">RAB</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
                </div>
              </div>

              {/* Exchange Filter */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  Exchange
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <select
                    value={selectedExchange}
                    onChange={(e) => setSelectedExchange(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-8 py-2 text-sm text-metallic-100 appearance-none focus:border-accent-gold focus:outline-none"
                  >
                    <option value="">All Exchanges</option>
                    {exchanges.length > 0 ? (
                      exchanges.map((exchange) => (
                        <option key={exchange} value={exchange}>
                          {exchange}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="ASX">ASX</option>
                        <option value="TSX">TSX</option>
                        <option value="TSX-V">TSX-V</option>
                        <option value="JSE">JSE</option>
                        <option value="CSE">CSE</option>
                        <option value="NYSE">NYSE</option>
                        <option value="LSE">LSE</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-3 py-2 text-sm text-metallic-100 focus:border-accent-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-3 py-2 text-sm text-metallic-100 focus:border-accent-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                {hasDrillingFilters && (
                  <button
                    onClick={clearAllDrillingFilters}
                    className="w-full px-3 py-2 text-sm text-metallic-400 hover:text-red-400 border border-metallic-700 hover:border-red-500/50 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {hasDrillingFilters && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-metallic-700">
                {selectedCompany && (
                  <FilterBadge label={`Company: ${selectedCompany}`} onClear={() => setSelectedCompany("")} />
                )}
                {selectedProject && (
                  <FilterBadge label={`Project: ${selectedProject}`} onClear={() => setSelectedProject("")} />
                )}
                {selectedDrillType && (
                  <FilterBadge label={`Type: ${selectedDrillType}`} onClear={() => setSelectedDrillType("")} />
                )}
                {selectedExchange && (
                  <FilterBadge label={`Exchange: ${selectedExchange}`} onClear={() => setSelectedExchange("")} />
                )}
                {dateFrom && (
                  <FilterBadge label={`From: ${dateFrom}`} onClear={() => setDateFrom("")} />
                )}
                {dateTo && (
                  <FilterBadge label={`To: ${dateTo}`} onClear={() => setDateTo("")} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Fixed Filters Panel - Intercepts */}
        {activeType === "intercepts" && (
          <div className="bg-metallic-800/50 rounded-lg border border-metallic-700 p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Company Filter */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  Company
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <select
                    value={selectedInterceptCompany}
                    onChange={(e) => setSelectedInterceptCompany(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-8 py-2 text-sm text-metallic-100 appearance-none focus:border-accent-gold focus:outline-none"
                  >
                    <option value="">All Companies</option>
                    {interceptCompanies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
                </div>
              </div>

              {/* Commodity Filter */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  Commodity
                </label>
                <div className="relative">
                  <Gem className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <select
                    value={selectedCommodity}
                    onChange={(e) => setSelectedCommodity(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-8 py-2 text-sm text-metallic-100 appearance-none focus:border-accent-gold focus:outline-none"
                  >
                    <option value="">All Commodities</option>
                    {interceptCommodities.map((commodity) => (
                      <option key={commodity} value={commodity}>
                        {commodity}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
                </div>
              </div>

              {/* Exchange Filter */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  Exchange
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <select
                    value={selectedInterceptExchange}
                    onChange={(e) => setSelectedInterceptExchange(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-8 py-2 text-sm text-metallic-100 appearance-none focus:border-accent-gold focus:outline-none"
                  >
                    <option value="">All Exchanges</option>
                    {interceptExchanges.length > 0 ? (
                      interceptExchanges.map((exchange) => (
                        <option key={exchange} value={exchange}>
                          {exchange}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="ASX">ASX</option>
                        <option value="TSX">TSX</option>
                        <option value="TSX-V">TSX-V</option>
                        <option value="JSE">JSE</option>
                        <option value="CSE">CSE</option>
                        <option value="NYSE">NYSE</option>
                        <option value="LSE">LSE</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
                </div>
              </div>

              {/* Min Grade */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  Min Grade (g/t)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={minGrade || ""}
                  onChange={(e) => setMinGrade(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 1.0"
                  className="w-full bg-metallic-900 border border-metallic-700 rounded-lg px-3 py-2 text-sm text-metallic-100 focus:border-accent-gold focus:outline-none"
                />
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <input
                    type="date"
                    value={interceptDateFrom}
                    onChange={(e) => setInterceptDateFrom(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-3 py-2 text-sm text-metallic-100 focus:border-accent-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <input
                    type="date"
                    value={interceptDateTo}
                    onChange={(e) => setInterceptDateTo(e.target.value)}
                    className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-3 py-2 text-sm text-metallic-100 focus:border-accent-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                {hasInterceptFilters && (
                  <button
                    onClick={clearAllInterceptFilters}
                    className="w-full px-3 py-2 text-sm text-metallic-400 hover:text-red-400 border border-metallic-700 hover:border-red-500/50 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {hasInterceptFilters && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-metallic-700">
                {selectedInterceptCompany && (
                  <FilterBadge label={`Company: ${selectedInterceptCompany}`} onClear={() => setSelectedInterceptCompany("")} />
                )}
                {selectedCommodity && (
                  <FilterBadge label={`Commodity: ${selectedCommodity}`} onClear={() => setSelectedCommodity("")} />
                )}
                {selectedInterceptExchange && (
                  <FilterBadge label={`Exchange: ${selectedInterceptExchange}`} onClear={() => setSelectedInterceptExchange("")} />
                )}
                {minGrade && (
                  <FilterBadge label={`Min Grade: ${minGrade} g/t`} onClear={() => setMinGrade(undefined)} />
                )}
                {interceptDateFrom && (
                  <FilterBadge label={`From: ${interceptDateFrom}`} onClear={() => setInterceptDateFrom("")} />
                )}
                {interceptDateTo && (
                  <FilterBadge label={`To: ${interceptDateTo}`} onClear={() => setInterceptDateTo("")} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Content Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-metallic-100">
              {activeData.title}
            </h2>
            <p className="text-sm text-metallic-400">{activeData.subtitle}</p>
          </div>
          {activeType === "drilling" && !loading && drillingData.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-metallic-400">
              <Building2 className="w-4 h-4" />
              <span>Showing {drillingData.length} of {totalDrilling.toLocaleString()} holes</span>
            </div>
          )}
          {activeType === "intercepts" && !loading && interceptsData.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-metallic-400">
              <Gem className="w-4 h-4" />
              <span>Showing {interceptsData.length} of {totalIntercepts.toLocaleString()} intercepts</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        {renderContent()}

        {/* Load More - Drilling */}
        {activeType === "drilling" && !loading && drillingData.length < totalDrilling && (
          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                try {
                  const response = await miningDataService.getExplorationDrilling({
                    symbol: selectedCompany || undefined,
                    project: selectedProject || undefined,
                    drillType: selectedDrillType || undefined,
                    exchange: selectedExchange || undefined,
                    dateFrom: dateFrom || undefined,
                    dateTo: dateTo || undefined,
                    limit: 100,
                    offset: drillingData.length,
                  });
                  setDrillingData([...drillingData, ...response.drilling]);
                } catch (err) {
                  console.error("Failed to load more:", err);
                }
              }}
              className="px-6 py-2 bg-metallic-800 hover:bg-metallic-700 border border-metallic-700 rounded-lg text-metallic-300 transition-colors"
            >
              Load More ({totalDrilling - drillingData.length} remaining)
            </button>
          </div>
        )}

        {/* Load More - Intercepts */}
        {activeType === "intercepts" && !loading && interceptsData.length < totalIntercepts && (
          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                try {
                  const response = await miningDataService.getDrillIntercepts({
                    symbol: selectedInterceptCompany || undefined,
                    commodity: selectedCommodity || undefined,
                    exchange: selectedInterceptExchange || undefined,
                    minGrade: minGrade,
                    dateFrom: interceptDateFrom || undefined,
                    dateTo: interceptDateTo || undefined,
                    limit: 100,
                    offset: interceptsData.length,
                  });
                  setInterceptsData([...interceptsData, ...response.intercepts]);
                } catch (err) {
                  console.error("Failed to load more:", err);
                }
              }}
              className="px-6 py-2 bg-metallic-800 hover:bg-metallic-700 border border-metallic-700 rounded-lg text-metallic-300 transition-colors"
            >
              Load More ({totalIntercepts - interceptsData.length} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
