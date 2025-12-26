'use client';

import React from 'react';
import { Filter, Map as MapIcon, Layers, Search, ChevronDown, Plus, Minus, Maximize2 } from 'lucide-react';

const MapInterfaceMockup = () => {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-metallic-700 shadow-2xl bg-metallic-900 flex flex-col h-[600px]">
      {/* Mockup Header */}
      <div className="bg-metallic-950 border-b border-metallic-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-metallic-900 border border-metallic-700 rounded-md text-sm text-metallic-300">
            <Search className="w-4 h-4" />
            <span>Search companies, projects...</span>
          </div>
          <div className="h-6 w-px bg-metallic-800"></div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-primary-400 bg-primary-900/20 border border-primary-800 rounded-md hover:bg-primary-900/30 transition-colors">
              Map View
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-metallic-400 hover:text-metallic-200 transition-colors">
              List View
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-metallic-500">749 Projects Loaded</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="w-2 h-2 rounded-full bg-metallic-700"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Filters */}
        <div className="w-64 bg-metallic-950/50 border-r border-metallic-800 p-4 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between text-metallic-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
            <span className="text-xs text-primary-500 cursor-pointer hover:underline">Reset</span>
          </div>

          <FilterGroup label="Commodity" value="Gold, Copper" />
          <FilterGroup label="Project Stage" value="Exploration, Dev" />
          <FilterGroup label="Jurisdiction" value="Canada, Australia" />
          <FilterGroup label="Resource Size" value="> 1M oz AuEq" />
          
          <div className="mt-auto p-4 bg-metallic-900 rounded-lg border border-metallic-800">
            <h4 className="text-sm font-semibold text-metallic-200 mb-2">Market Insight</h4>
            <p className="text-xs text-metallic-400 leading-relaxed">
              Copper projects in Tier 1 jurisdictions are trading at a 15% premium vs. peer average.
            </p>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-metallic-900">
          {/* Abstract Map Background */}
          <div className="absolute inset-0 opacity-20">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
          </div>
          
          {/* Continents (Abstract) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
             <MapIcon className="w-96 h-96 text-metallic-500" />
          </div>

          {/* Data Points (Pins) */}
          <MapPin top="30%" left="25%" color="bg-primary-500" label="Au" />
          <MapPin top="35%" left="28%" color="bg-accent-copper" label="Cu" />
          <MapPin top="32%" left="22%" color="bg-primary-500" label="Au" />
          
          <MapPin top="60%" left="75%" color="bg-primary-500" label="Au" />
          <MapPin top="65%" left="72%" color="bg-accent-copper" label="Cu" />
          <MapPin top="58%" left="78%" color="bg-purple-500" label="Li" />
          
          <MapPin top="25%" left="60%" color="bg-purple-500" label="Li" />
          <MapPin top="45%" left="55%" color="bg-accent-copper" label="Cu" />

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <button className="p-2 bg-metallic-800 border border-metallic-700 rounded-md text-metallic-300 hover:bg-metallic-700 hover:text-white shadow-lg">
              <Plus className="w-4 h-4" />
            </button>
            <button className="p-2 bg-metallic-800 border border-metallic-700 rounded-md text-metallic-300 hover:bg-metallic-700 hover:text-white shadow-lg">
              <Minus className="w-4 h-4" />
            </button>
            <button className="p-2 bg-metallic-800 border border-metallic-700 rounded-md text-metallic-300 hover:bg-metallic-700 hover:text-white shadow-lg mt-2">
              <Layers className="w-4 h-4" />
            </button>
          </div>
          
          {/* Floating Info Card */}
          <div className="absolute top-6 right-6 w-64 bg-metallic-900/90 backdrop-blur-md border border-metallic-700 rounded-lg p-4 shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-metallic-100">Red Mountain</h3>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full border border-green-500/30">Active</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-metallic-400">Commodity</span>
                <span className="text-accent-copper font-medium">Copper-Gold</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-metallic-400">Resource</span>
                <span className="text-metallic-200">4.2M oz AuEq</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-metallic-400">Valuation</span>
                <span className="text-metallic-200">$42/oz</span>
              </div>
            </div>
            <button className="w-full mt-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium rounded transition-colors">
              View Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterGroup = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-metallic-300">{label}</label>
    <div className="flex items-center justify-between px-3 py-2 bg-metallic-900 border border-metallic-800 rounded-md cursor-pointer hover:border-metallic-600 transition-colors">
      <span className="text-sm text-metallic-200">{value}</span>
      <ChevronDown className="w-3 h-3 text-metallic-500" />
    </div>
  </div>
);

const MapPin = ({ top, left, color, label }: { top: string, left: string, color: string, label: string }) => (
  <div 
    className="absolute group cursor-pointer"
    style={{ top, left }}
  >
    <div className={`w-3 h-3 ${color} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)] ring-2 ring-metallic-900 group-hover:scale-125 transition-transform`}></div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-metallic-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-metallic-700">
      {label}
    </div>
  </div>
);

export default MapInterfaceMockup;
