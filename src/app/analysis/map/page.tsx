'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, ChevronDown, MapPin, Layers, ZoomIn, ZoomOut,
  ArrowUpRight, ArrowDownRight, Building2, X, Maximize2
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

// Mock project data with coordinates
const projects = [
  { id: 1, name: 'Red Lake Extension', company: 'Goldstrike Resources', ticker: 'GSR', commodity: 'Au', country: 'Canada', region: 'Ontario', lat: 51.0, lng: -93.8, stage: 'exploration', change: 5.2 },
  { id: 2, name: 'Detour Lake', company: 'Agnico Eagle', ticker: 'AEM', commodity: 'Au', country: 'Canada', region: 'Ontario', lat: 50.3, lng: -79.8, stage: 'production', change: 2.1 },
  { id: 3, name: 'Cadia Valley', company: 'Newcrest Mining', ticker: 'NCM', commodity: 'Au', country: 'Australia', region: 'NSW', lat: -33.5, lng: 149.0, stage: 'production', change: -1.2 },
  { id: 4, name: 'Escondida', company: 'BHP Group', ticker: 'BHP', commodity: 'Cu', country: 'Chile', region: 'Atacama', lat: -24.3, lng: -69.1, stage: 'production', change: 1.8 },
  { id: 5, name: 'Thacker Pass', company: 'Lithium Americas', ticker: 'LAC', commodity: 'Li', country: 'USA', region: 'Nevada', lat: 41.6, lng: -117.2, stage: 'construction', change: 8.5 },
  { id: 6, name: 'McArthur River', company: 'Cameco Corp', ticker: 'CCJ', commodity: 'U', country: 'Canada', region: 'Saskatchewan', lat: 57.8, lng: -105.0, stage: 'production', change: 4.3 },
  { id: 7, name: 'Morenci', company: 'Freeport-McMoRan', ticker: 'FCX', commodity: 'Cu', country: 'USA', region: 'Arizona', lat: 33.1, lng: -109.4, stage: 'production', change: 2.5 },
  { id: 8, name: 'Pilbara', company: 'Rio Tinto', ticker: 'RIO', commodity: 'Fe', country: 'Australia', region: 'WA', lat: -22.3, lng: 118.6, stage: 'production', change: 1.2 },
  { id: 9, name: 'Bushveld Complex', company: 'Anglo American', ticker: 'AAL', commodity: 'Pt', country: 'South Africa', region: 'Limpopo', lat: -25.1, lng: 29.5, stage: 'production', change: -0.8 },
  { id: 10, name: 'Grasberg', company: 'Freeport Indonesia', ticker: 'FCX', commodity: 'Cu', country: 'Indonesia', region: 'Papua', lat: -4.0, lng: 137.1, stage: 'production', change: 3.1 },
];

// SVG World Map with markers
function WorldMap({ 
  projects: projectData, 
  selectedCommodity, 
  selectedStage,
  onProjectClick 
}: { 
  projects: typeof projects;
  selectedCommodity: string;
  selectedStage: string;
  onProjectClick: (project: typeof projects[0]) => void;
}) {
  const [hoveredProject, setHoveredProject] = useState<typeof projects[0] | null>(null);
  const [zoom, setZoom] = useState(1);

  // Convert lat/lng to SVG coordinates (simplified projection)
  const toSvgCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  const filteredProjects = projectData.filter(p => {
    const matchesCommodity = selectedCommodity === 'all' || p.commodity === selectedCommodity;
    const matchesStage = selectedStage === 'all' || p.stage === selectedStage;
    return matchesCommodity && matchesStage;
  });

  return (
    <div className="relative bg-metallic-900 rounded-xl border border-metallic-800 overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
          className="p-2 bg-metallic-800 rounded-lg hover:bg-metallic-700 text-metallic-300"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.25, 1))}
          className="p-2 bg-metallic-800 rounded-lg hover:bg-metallic-700 text-metallic-300"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-2 bg-metallic-800 rounded-lg hover:bg-metallic-700 text-metallic-300"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Map SVG */}
      <div className="overflow-auto" style={{ maxHeight: '600px' }}>
        <svg 
          viewBox={`0 0 1000 500`} 
          className="w-full transition-transform duration-300"
          style={{ 
            minWidth: `${1000 * zoom}px`,
            minHeight: `${500 * zoom}px`,
          }}
        >
          {/* Background */}
          <rect fill="#1a1a2e" width="1000" height="500" />
          
          {/* Simplified continent outlines */}
          <g stroke="#2a2a4e" strokeWidth="0.5" fill="#252542">
            {/* North America */}
            <path d="M100,80 L250,60 L300,100 L280,200 L200,280 L100,250 L80,150 Z" />
            {/* South America */}
            <path d="M200,280 L280,300 L300,400 L250,450 L180,420 L170,320 Z" />
            {/* Europe */}
            <path d="M450,80 L550,60 L580,120 L520,180 L450,160 Z" />
            {/* Africa */}
            <path d="M450,180 L550,160 L580,280 L540,400 L470,380 L450,260 Z" />
            {/* Asia */}
            <path d="M580,60 L800,40 L900,100 L880,200 L750,250 L600,200 L580,120 Z" />
            {/* Australia */}
            <path d="M780,320 L900,300 L920,380 L850,420 L780,380 Z" />
          </g>

          {/* Grid lines */}
          <g stroke="#2a2a4e" strokeWidth="0.3" opacity="0.5">
            {[...Array(9)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 55 + 55} x2="1000" y2={i * 55 + 55} />
            ))}
            {[...Array(18)].map((_, i) => (
              <line key={`v${i}`} x1={i * 55 + 55} y1="0" x2={i * 55 + 55} y2="500" />
            ))}
          </g>

          {/* Project Markers */}
          {filteredProjects.map((project) => {
            const { x, y } = toSvgCoords(project.lat, project.lng);
            const color = getCommodityColor(project.commodity);
            const isHovered = hoveredProject?.id === project.id;

            return (
              <g key={project.id}>
                {/* Pulse animation */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 20 : 12}
                  fill={color}
                  opacity={0.3}
                  className="animate-ping"
                />
                {/* Main marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 5}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="1"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredProject(project)}
                  onMouseLeave={() => setHoveredProject(null)}
                  onClick={() => onProjectClick(project)}
                />
              </g>
            );
          })}

          {/* Tooltip */}
          {hoveredProject && (() => {
            const { x, y } = toSvgCoords(hoveredProject.lat, hoveredProject.lng);
            const tooltipX = x > 800 ? x - 180 : x + 15;
            const tooltipY = y > 400 ? y - 80 : y;
            
            return (
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect
                  x="0"
                  y="0"
                  width="170"
                  height="75"
                  rx="8"
                  fill="#1e1e2e"
                  stroke="#3a3a5e"
                />
                <text x="12" y="22" fill="#fff" fontSize="12" fontWeight="bold">
                  {hoveredProject.ticker}
                </text>
                <text x="50" y="22" fill="#888" fontSize="10">
                  {hoveredProject.company}
                </text>
                <text x="12" y="42" fill="#aaa" fontSize="10">
                  {hoveredProject.name}
                </text>
                <text x="12" y="62" fill="#aaa" fontSize="10">
                  {hoveredProject.region}, {hoveredProject.country}
                </text>
                <text 
                  x="135" 
                  y="62" 
                  fill={hoveredProject.change >= 0 ? '#4ade80' : '#f87171'} 
                  fontSize="10"
                  fontWeight="bold"
                >
                  {hoveredProject.change >= 0 ? '+' : ''}{hoveredProject.change}%
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-metallic-800/90 backdrop-blur-sm rounded-lg p-4">
        <h4 className="text-xs font-medium text-metallic-400 mb-2">Commodities</h4>
        <div className="flex flex-wrap gap-3">
          {['Au', 'Cu', 'Li', 'U', 'Fe', 'Pt'].map((c) => (
            <div key={c} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCommodityColor(c) }}
              />
              <span className="text-xs text-metallic-300">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Project count */}
      <div className="absolute top-4 left-4 bg-metallic-800/90 backdrop-blur-sm rounded-lg px-4 py-2">
        <span className="text-sm text-metallic-300">
          <span className="font-bold text-metallic-100">{filteredProjects.length}</span> projects shown
        </span>
      </div>
    </div>
  );
}

function ProjectDetailPanel({ 
  project, 
  onClose 
}: { 
  project: typeof projects[0];
  onClose: () => void;
}) {
  const isPositive = project.change >= 0;
  const commodityColor = getCommodityColor(project.commodity);

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: commodityColor }}
          >
            {project.commodity}
          </div>
          <div>
            <Link 
              href={`/company/${project.ticker}`}
              className="font-semibold text-metallic-100 hover:text-primary-400 transition-colors"
            >
              {project.ticker}
            </Link>
            <p className="text-sm text-metallic-500">{project.company}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-metallic-800 text-metallic-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <h3 className="text-lg font-medium text-metallic-100 mb-2">{project.name}</h3>
      
      <div className="flex items-center gap-2 text-sm text-metallic-400 mb-4">
        <MapPin className="w-4 h-4" />
        {project.region}, {project.country}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-metallic-800/50 rounded-lg p-3">
          <p className="text-xs text-metallic-500 mb-1">Stage</p>
          <p className="text-sm font-medium text-metallic-100 capitalize">{project.stage}</p>
        </div>
        <div className="bg-metallic-800/50 rounded-lg p-3">
          <p className="text-xs text-metallic-500 mb-1">Day Change</p>
          <p className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {isPositive ? '+' : ''}{project.change}%
          </p>
        </div>
      </div>

      <Link
        href={`/company/${project.ticker}`}
        className="block text-center py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
      >
        View Full Profile
      </Link>
    </div>
  );
}

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

  const commodities = ['all', 'Au', 'Cu', 'Li', 'U', 'Fe', 'Ag', 'Ni', 'Pt'];
  const stages = ['all', 'exploration', 'pfs', 'fs', 'construction', 'production'];

  const handleProjectClick = useCallback((project: typeof projects[0]) => {
    setSelectedProject(project);
  }, []);

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
              <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
              <span>/</span>
              <span className="text-metallic-300">Interactive Map</span>
            </div>
            <h1 className="text-2xl font-bold text-metallic-100">Global Mining Map</h1>
            <p className="text-metallic-400 text-sm">Explore mining projects worldwide with interactive filtering</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
              <input
                type="text"
                placeholder="Search projects, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {commodities.map((c) => (
                    <option key={c} value={c}>{c === 'all' ? 'All Commodities' : c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>{s === 'all' ? 'All Stages' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <WorldMap 
              projects={projects}
              selectedCommodity={selectedCommodity}
              selectedStage={selectedStage}
              onProjectClick={handleProjectClick}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedProject ? (
              <ProjectDetailPanel 
                project={selectedProject} 
                onClose={() => setSelectedProject(null)} 
              />
            ) : (
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                <h3 className="font-semibold text-metallic-100 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Map Layers
                </h3>
                <div className="space-y-3">
                  {['Mining Projects', 'Infrastructure', 'Geology', 'Tenements'].map((layer) => (
                    <label key={layer} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={layer === 'Mining Projects'}
                        className="w-4 h-4 rounded border-metallic-600 bg-metallic-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-metallic-300">{layer}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h3 className="font-semibold text-metallic-100 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">Total Projects</span>
                  <span className="font-medium text-metallic-100">{projects.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">Countries</span>
                  <span className="font-medium text-metallic-100">
                    {new Set(projects.map(p => p.country)).size}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">Commodities</span>
                  <span className="font-medium text-metallic-100">
                    {new Set(projects.map(p => p.commodity)).size}
                  </span>
                </div>
              </div>
            </div>

            {/* Project List */}
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-metallic-800">
                <h3 className="font-semibold text-metallic-100">Visible Projects</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {projects
                  .filter(p => 
                    (selectedCommodity === 'all' || p.commodity === selectedCommodity) &&
                    (selectedStage === 'all' || p.stage === selectedStage)
                  )
                  .map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-metallic-800/50 transition-colors text-left border-b border-metallic-800/50 last:border-b-0"
                    >
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: getCommodityColor(project.commodity) }}
                      >
                        {project.commodity}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-metallic-100 text-sm truncate">{project.ticker}</div>
                        <div className="text-xs text-metallic-500 truncate">{project.name}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
