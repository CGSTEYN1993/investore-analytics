'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, ChevronDown, ArrowUpRight, ArrowLeft, Calendar, FolderOpen, X,
  Play, Pause, Clock, Layers, CheckCircle, CircleDot, Settings,
  Building2, Loader2, Globe
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';
import miningDataService, { ProjectByPhase, ProjectPhasesResponse } from '@/services/miningData';

// Phase configuration with icons and colors
const phaseConfig: Record<string, { name: string; color: string; icon: any; description: string }> = {
  'exploration': { 
    name: 'Exploration',
    color: '#60A5FA',
    icon: Search,
    description: 'Grassroots exploration and target generation'
  },
  'advanced_exploration': { 
    name: 'Advanced Exploration',
    color: '#34D399',
    icon: Layers,
    description: 'Drilling programs and resource delineation'
  },
  'resource_definition': {
    name: 'Resource Definition',
    color: '#2DD4BF',
    icon: Layers,
    description: 'Resource drilling and estimation'
  },
  'scoping': { 
    name: 'Scoping Study',
    color: '#A78BFA',
    icon: CircleDot,
    description: 'Initial economic assessment'
  },
  'scoping_study': { 
    name: 'Scoping Study',
    color: '#A78BFA',
    icon: CircleDot,
    description: 'Initial economic assessment'
  },
  'prefeasibility': { 
    name: 'Pre-Feasibility',
    color: '#FBBF24',
    icon: Settings,
    description: 'Pre-Feasibility Study in progress or completed'
  },
  'pre_feasibility': { 
    name: 'Pre-Feasibility',
    color: '#FBBF24',
    icon: Settings,
    description: 'Pre-Feasibility Study in progress or completed'
  },
  'feasibility': { 
    name: 'Feasibility',
    color: '#F97316',
    icon: CheckCircle,
    description: 'Definitive Feasibility Study completed'
  },
  'permitting': { 
    name: 'Permitting',
    color: '#EC4899',
    icon: Clock,
    description: 'Awaiting permits and approvals'
  },
  'construction': { 
    name: 'Construction',
    color: '#EF4444',
    icon: Play,
    description: 'Mine under construction'
  },
  'commissioning': {
    name: 'Commissioning',
    color: '#FB923C',
    icon: Play,
    description: 'Mine commissioning phase'
  },
  'production': { 
    name: 'Production',
    color: '#10B981',
    icon: Play,
    description: 'Operating mines'
  },
  'expansion': {
    name: 'Expansion',
    color: '#22D3EE',
    icon: Play,
    description: 'Mine expansion project'
  },
  'care_and_maintenance': { 
    name: 'Care & Maintenance',
    color: '#6B7280',
    icon: Pause,
    description: 'Temporarily suspended operations'
  },
  'care_maintenance': { 
    name: 'Care & Maintenance',
    color: '#6B7280',
    icon: Pause,
    description: 'Temporarily suspended operations'
  },
  'closure': {
    name: 'Closure',
    color: '#4B5563',
    icon: Pause,
    description: 'Mine closure phase'
  },
  'grassroots': {
    name: 'Grassroots',
    color: '#93C5FD',
    icon: Search,
    description: 'Early stage exploration'
  },
  'unknown': {
    name: 'Unknown',
    color: '#9CA3AF',
    icon: CircleDot,
    description: 'Phase not specified'
  }
};

function getPhaseConfig(phase: string) {
  const normalized = phase?.toLowerCase().replace(/[- ]/g, '_') || 'unknown';
  return phaseConfig[normalized] || phaseConfig['unknown'];
}

// Active filter badge
const FilterBadge = ({ label, onClear }: { label: string; onClear: () => void }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-gold/20 text-accent-gold text-xs rounded-full">
    {label}
    <button onClick={onClear} className="hover:text-white">
      <X className="w-3 h-3" />
    </button>
  </span>
);

// Phase card component
function PhaseCard({ 
  phaseId, 
  count, 
  isSelected, 
  onClick 
}: { 
  phaseId: string; 
  count: number; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = getPhaseConfig(phaseId);
  const Icon = config.icon;
  
  return (
    <button
      onClick={onClick}
      className={`group bg-metallic-900 border rounded-xl p-6 text-left transition-all ${
        isSelected 
          ? 'border-accent-gold ring-2 ring-accent-gold/20' 
          : 'border-metallic-800 hover:border-primary-500/50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: config.color }} />
        </div>
        <span 
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          {count.toLocaleString()}
        </span>
      </div>
      <h3 className={`font-semibold mb-1 transition-colors ${
        isSelected ? 'text-accent-gold' : 'text-metallic-100 group-hover:text-primary-400'
      }`}>
        {config.name}
      </h3>
      <p className="text-sm text-metallic-500">{config.description}</p>
    </button>
  );
}

// Project row component
function ProjectRow({ project }: { project: ProjectByPhase }) {
  const commodityColor = getCommodityColor(project.commodity || 'Au');
  const config = getPhaseConfig(project.current_phase || 'unknown');

  return (
    <Link
      href={`/company/${project.symbol}`}
      className="flex items-center justify-between p-4 border-b border-metallic-800 last:border-b-0 hover:bg-metallic-800/30 transition-colors"
    >
      <div className="flex items-center gap-4 flex-1">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: commodityColor }}
        >
          {project.commodity || '?'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-metallic-100">{project.symbol}</span>
            <span className="text-sm text-metallic-500">• {project.project_name}</span>
          </div>
          <div className="text-sm text-metallic-400 flex items-center gap-2">
            <span 
              className="px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              {config.name}
            </span>
            {project.study_type && (
              <span className="text-metallic-500">• {project.study_type}</span>
            )}
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
        {project.mine_life_years && (
          <div className="text-sm text-metallic-400">
            <span className="text-metallic-300">{project.mine_life_years.toFixed(0)}</span> yr mine life
          </div>
        )}
        {project.first_production_year && (
          <div className="text-sm text-metallic-400">
            First prod: <span className="text-metallic-300">{project.first_production_year}</span>
          </div>
        )}
        {project.announcement_date && (
          <div className="text-sm text-metallic-500">
            {new Date(project.announcement_date).toLocaleDateString()}
          </div>
        )}
      </div>
      <ArrowUpRight className="w-4 h-4 text-metallic-500 ml-4" />
    </Link>
  );
}

// Loading skeleton
function ProjectRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-metallic-800 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-metallic-700" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-metallic-700 rounded" />
          <div className="h-3 w-48 bg-metallic-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function StagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  // API data
  const [phasesData, setPhasesData] = useState<{ [phase: string]: number }>({});
  const [projects, setProjects] = useState<ProjectByPhase[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [companies, setCompanies] = useState<string[]>([]);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [exchanges, setExchanges] = useState<string[]>([]);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await miningDataService.getProjectsByPhase({
          phase: selectedPhase || undefined,
          symbol: selectedCompany || undefined,
          project: selectedProject || undefined,
          exchange: selectedExchange || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          limit: 100,
        });
        
        setPhasesData(response.phases);
        setProjects(response.projects);
        setTotalProjects(response.total);
        setCompanies(response.companies || []);
        setProjectNames(response.project_names || []);
        setExchanges(response.exchanges || []);
      } catch (err) {
        console.error("Failed to fetch project phases:", err);
        setError("Failed to load project data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [selectedPhase, selectedCompany, selectedProject, selectedExchange, dateFrom, dateTo]);

  // Sort phases by count for display
  const sortedPhases = Object.entries(phasesData)
    .sort((a, b) => b[1] - a[1]);

  const totalFromPhases = Object.values(phasesData).reduce((sum, count) => sum + count, 0);

  // Filter projects by search
  const filteredProjects = projects.filter(p => 
    !searchTerm || 
    p.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check for active filters
  const hasFilters = selectedCompany || selectedProject || selectedExchange || dateFrom || dateTo || selectedPhase;

  const clearAllFilters = () => {
    setSelectedCompany('');
    setSelectedProject('');
    setSelectedExchange('');
    setDateFrom('');
    setDateTo('');
    setSelectedPhase(null);
  };

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
              <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
              <span>/</span>
              <span className="text-metallic-300">Project Stages</span>
            </div>
            <h1 className="text-2xl font-bold text-metallic-100">Project Development Stages</h1>
            <p className="text-metallic-400 text-sm">
              Browse {totalFromPhases.toLocaleString()} projects extracted from ASX announcements by development stage
            </p>
          </div>

          {/* Phase Progress Bar */}
          {!loading && sortedPhases.length > 0 && (
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-metallic-400">Project Distribution by Stage</span>
                <span className="text-sm text-metallic-300">{totalFromPhases.toLocaleString()} total projects</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden">
                {sortedPhases.map(([phase, count]) => {
                  const config = getPhaseConfig(phase);
                  return (
                    <div
                      key={phase}
                      className="relative group cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ 
                        width: `${(count / totalFromPhases) * 100}%`,
                        backgroundColor: config.color,
                      }}
                      onClick={() => setSelectedPhase(phase === selectedPhase ? null : phase)}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-metallic-800 border border-metallic-700 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {config.name}: {count.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                {sortedPhases.slice(0, 6).map(([phase]) => {
                  const config = getPhaseConfig(phase);
                  return (
                    <div key={phase} className="flex items-center gap-2 text-xs text-metallic-400">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: config.color }} />
                      {config.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase Cards Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-metallic-700" />
                  <div className="w-16 h-6 rounded-full bg-metallic-700" />
                </div>
                <div className="h-5 w-32 bg-metallic-700 rounded mb-2" />
                <div className="h-4 w-48 bg-metallic-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {sortedPhases.map(([phase, count]) => (
              <PhaseCard 
                key={phase} 
                phaseId={phase} 
                count={count}
                isSelected={selectedPhase === phase}
                onClick={() => setSelectedPhase(phase === selectedPhase ? null : phase)}
              />
            ))}
          </div>
        )}

        {/* Fixed Filter Panel */}
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
                  {companies.slice(0, 100).map((company) => (
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
                  {projectNames.slice(0, 100).map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
              </div>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                Stage
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                <select
                  value={selectedPhase || ''}
                  onChange={(e) => setSelectedPhase(e.target.value || null)}
                  className="w-full bg-metallic-900 border border-metallic-700 rounded-lg pl-9 pr-8 py-2 text-sm text-metallic-100 appearance-none focus:border-accent-gold focus:outline-none"
                >
                  <option value="">All Stages</option>
                  {sortedPhases.map(([phase]) => {
                    const config = getPhaseConfig(phase);
                    return (
                      <option key={phase} value={phase}>{config.name}</option>
                    );
                  })}
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
              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full px-3 py-2 text-sm text-metallic-400 hover:text-red-400 border border-metallic-700 hover:border-red-500/50 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-metallic-700">
              {selectedCompany && (
                <FilterBadge label={`Company: ${selectedCompany}`} onClear={() => setSelectedCompany('')} />
              )}
              {selectedProject && (
                <FilterBadge label={`Project: ${selectedProject}`} onClear={() => setSelectedProject('')} />
              )}
              {selectedPhase && (
                <FilterBadge label={`Stage: ${getPhaseConfig(selectedPhase).name}`} onClear={() => setSelectedPhase(null)} />
              )}
              {selectedExchange && (
                <FilterBadge label={`Exchange: ${selectedExchange}`} onClear={() => setSelectedExchange('')} />
              )}
              {dateFrom && (
                <FilterBadge label={`From: ${dateFrom}`} onClear={() => setDateFrom('')} />
              )}
              {dateTo && (
                <FilterBadge label={`To: ${dateTo}`} onClear={() => setDateTo('')} />
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
          <input
            type="text"
            placeholder="Search projects or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-metallic-500" />
            <span className="text-metallic-300">
              {selectedPhase ? (
                <>Showing {filteredProjects.length} {getPhaseConfig(selectedPhase).name} projects</>
              ) : (
                <>Showing {filteredProjects.length} of {totalProjects.toLocaleString()} projects</>
              )}
            </span>
          </div>
        </div>

        {/* Projects List */}
        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setSelectedPhase(selectedPhase)}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <ProjectRowSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-metallic-800/30 rounded-lg border border-dashed border-metallic-600 p-8 text-center">
            <p className="text-metallic-400 text-lg mb-2">No projects found</p>
            <p className="text-metallic-500 text-sm">
              {searchTerm || hasFilters ? 'Try adjusting your filters or search term' : 'No projects available'}
            </p>
          </div>
        ) : (
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
            {filteredProjects.map((project) => (
              <ProjectRow key={`${project.symbol}-${project.id}`} project={project} />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && filteredProjects.length < totalProjects && (
          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                try {
                  const response = await miningDataService.getProjectsByPhase({
                    phase: selectedPhase || undefined,
                    symbol: selectedCompany || undefined,
                    project: selectedProject || undefined,
                    exchange: selectedExchange || undefined,
                    dateFrom: dateFrom || undefined,
                    dateTo: dateTo || undefined,
                    limit: 100,
                    offset: projects.length,
                  });
                  setProjects([...projects, ...response.projects]);
                } catch (err) {
                  console.error("Failed to load more:", err);
                }
              }}
              className="px-6 py-2 bg-metallic-800 hover:bg-metallic-700 border border-metallic-700 rounded-lg text-metallic-300 transition-colors"
            >
              Load More ({totalProjects - projects.length} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
