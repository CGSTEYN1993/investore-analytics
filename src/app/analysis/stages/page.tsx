'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, ChevronDown, ArrowUpRight, ArrowDownRight,
  Play, Pause, Clock, Layers, CheckCircle, CircleDot, Settings, ArrowLeft
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

// Project stage definitions with icons and colors
const projectStages = [
  { 
    id: 'exploration', 
    name: 'Early Exploration',
    description: 'Grassroots exploration and target generation',
    color: '#60A5FA', // blue
    count: 1245,
    icon: Search,
  },
  { 
    id: 'advanced-exploration', 
    name: 'Advanced Exploration',
    description: 'Drilling programs and resource delineation',
    color: '#34D399', // green
    count: 876,
    icon: Layers,
  },
  { 
    id: 'pea', 
    name: 'PEA Stage',
    description: 'Preliminary Economic Assessment completed',
    color: '#FBBF24', // yellow
    count: 432,
    icon: CircleDot,
  },
  { 
    id: 'pfs', 
    name: 'Pre-Feasibility',
    description: 'Pre-Feasibility Study in progress or completed',
    color: '#F97316', // orange
    count: 287,
    icon: Settings,
  },
  { 
    id: 'fs', 
    name: 'Feasibility',
    description: 'Definitive Feasibility Study completed',
    color: '#EF4444', // red
    count: 156,
    icon: CheckCircle,
  },
  { 
    id: 'construction', 
    name: 'Construction',
    description: 'Mine under construction',
    color: '#A855F7', // purple
    count: 89,
    icon: Play,
  },
  { 
    id: 'production', 
    name: 'Production',
    description: 'Operating mines',
    color: '#10B981', // emerald
    count: 654,
    icon: Play,
  },
  { 
    id: 'care-maintenance', 
    name: 'Care & Maintenance',
    description: 'Temporarily suspended operations',
    color: '#6B7280', // gray
    count: 123,
    icon: Pause,
  },
];

// Mock projects by stage
const projectsByStage: Record<string, Array<{
  ticker: string;
  company: string;
  project: string;
  commodity: string;
  country: string;
  nextMilestone: string;
  change: number;
}>> = {
  'exploration': [
    { ticker: 'GDX', company: 'Gold Explorers Inc', project: 'Red Lake North', commodity: 'Au', country: 'Canada', nextMilestone: 'Drill results Q1 2025', change: 5.23 },
    { ticker: 'CUX', company: 'Copper Quest', project: 'Verde Grande', commodity: 'Cu', country: 'Peru', nextMilestone: 'Phase 2 drilling', change: -2.15 },
    { ticker: 'LIT', company: 'Lithium Frontier', project: 'Atacama West', commodity: 'Li', country: 'Chile', nextMilestone: 'Brine sampling', change: 8.45 },
  ],
  'pfs': [
    { ticker: 'NGM', company: 'NextGen Minerals', project: 'Sunrise Gold', commodity: 'Au', country: 'Australia', nextMilestone: 'PFS completion Q2 2025', change: 3.12 },
    { ticker: 'BCM', company: 'Base Copper Mining', project: 'Andean Copper', commodity: 'Cu', country: 'Chile', nextMilestone: 'Resource update', change: 1.87 },
  ],
  'production': [
    { ticker: 'BRK', company: 'Barrick Gold', project: 'Nevada Operations', commodity: 'Au', country: 'USA', nextMilestone: 'Q4 production report', change: 2.34 },
    { ticker: 'FCX', company: 'Freeport-McMoRan', project: 'Grasberg', commodity: 'Cu', country: 'Indonesia', nextMilestone: 'Annual guidance', change: -0.89 },
    { ticker: 'RIO', company: 'Rio Tinto', project: 'Pilbara Operations', commodity: 'Fe', country: 'Australia', nextMilestone: 'Shipment update', change: 1.56 },
  ],
};

function StageCard({ stage }: { stage: typeof projectStages[0] }) {
  const Icon = stage.icon;
  
  return (
    <Link
      href={`/analysis/stages/${stage.id}`}
      className="group bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:border-primary-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${stage.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: stage.color }} />
        </div>
        <span 
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
        >
          {stage.count.toLocaleString()}
        </span>
      </div>
      <h3 className="font-semibold text-metallic-100 mb-1 group-hover:text-primary-400 transition-colors">
        {stage.name}
      </h3>
      <p className="text-sm text-metallic-500">{stage.description}</p>
    </Link>
  );
}

function ProjectRow({ project }: { project: typeof projectsByStage['exploration'][0] }) {
  const isPositive = project.change >= 0;
  const commodityColor = getCommodityColor(project.commodity);

  return (
    <Link
      href={`/company/${project.ticker}`}
      className="flex items-center justify-between p-4 border-b border-metallic-800 last:border-b-0 hover:bg-metallic-800/30 transition-colors"
    >
      <div className="flex items-center gap-4 flex-1">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: commodityColor }}
        >
          {project.commodity}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-metallic-100">{project.ticker}</span>
            <span className="text-sm text-metallic-500">• {project.company}</span>
          </div>
          <div className="text-sm text-metallic-400">
            {project.project} • {project.country}
          </div>
        </div>
      </div>
      <div className="hidden md:block flex-1">
        <div className="flex items-center gap-2 text-sm text-metallic-400">
          <Clock className="w-4 h-4" />
          {project.nextMilestone}
        </div>
      </div>
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {isPositive ? '+' : ''}{project.change.toFixed(2)}%
      </div>
    </Link>
  );
}

export default function StagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [commodityFilter, setCommodityFilter] = useState('all');

  const commodities = ['all', 'Au', 'Cu', 'Li', 'Fe', 'Ag', 'Ni', 'Zn', 'U'];

  const totalProjects = projectStages.reduce((sum, s) => sum + s.count, 0);

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
            <p className="text-metallic-400 text-sm">Filter projects by development stage from exploration to production</p>
          </div>

          {/* Stage Progress Bar */}
          <div className="bg-metallic-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-metallic-400">Project Distribution by Stage</span>
              <span className="text-sm text-metallic-300">{totalProjects.toLocaleString()} total projects</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden">
              {projectStages.map((stage) => (
                <div
                  key={stage.id}
                  className="relative group cursor-pointer"
                  style={{ 
                    width: `${(stage.count / totalProjects) * 100}%`,
                    backgroundColor: stage.color,
                  }}
                  onClick={() => setSelectedStage(stage.id === selectedStage ? null : stage.id)}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-metallic-800 border border-metallic-700 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {stage.name}: {stage.count}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {projectStages.map((stage) => (
                <div key={stage.id} className="flex items-center gap-2 text-xs text-metallic-400">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: stage.color }} />
                  {stage.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stage Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {projectStages.map((stage) => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
            <input
              type="text"
              placeholder="Search projects or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={selectedStage || 'all'}
                onChange={(e) => setSelectedStage(e.target.value === 'all' ? null : e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Stages</option>
                {projectStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={commodityFilter}
                onChange={(e) => setCommodityFilter(e.target.value)}
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

        {/* Featured Projects by Stage */}
        <div className="space-y-6">
          {['exploration', 'pfs', 'production'].map((stageId) => {
            const stage = projectStages.find(s => s.id === stageId);
            const projects = projectsByStage[stageId] || [];
            
            if (!stage || (!selectedStage || selectedStage === stageId) === false) return null;
            if (selectedStage && selectedStage !== stageId) return null;

            return (
              <div key={stageId} className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 border-b border-metallic-800"
                  style={{ backgroundColor: `${stage.color}10` }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stage.color}30` }}
                    >
                      <stage.icon className="w-4 h-4" style={{ color: stage.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-metallic-100">{stage.name}</h3>
                      <p className="text-xs text-metallic-500">{stage.count} projects</p>
                    </div>
                  </div>
                  <Link
                    href={`/analysis/stages/${stageId}`}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    View all →
                  </Link>
                </div>
                <div>
                  {projects.map((project) => (
                    <ProjectRow key={project.ticker} project={project} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
