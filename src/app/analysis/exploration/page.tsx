"use client";

import React, { useState } from "react";
import {
  Drill,
  Mountain,
  Droplets,
  Waves,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Download,
  Eye,
  Plus,
} from "lucide-react";

// Exploration data types
const explorationTypes = [
  { id: "drilling", name: "Drilling", icon: Drill, color: "bg-red-500" },
  { id: "rocks", name: "Rocks", icon: Mountain, color: "bg-amber-500" },
  { id: "soils", name: "Soils", icon: Droplets, color: "bg-green-500" },
  { id: "streams", name: "Streams", icon: Waves, color: "bg-blue-500" },
];

// Mock drilling data
const drillingData = [
  {
    id: "DH001",
    project: "Mount Magnet Gold",
    type: "RC",
    depth: 150,
    date: "2024-01-15",
    status: "Completed",
    lat: -28.0556,
    lng: 117.8425,
    assays: { Au: 2.4, Cu: 0.12 },
  },
  {
    id: "DH002",
    project: "Kalgoorlie East",
    type: "Diamond",
    depth: 320,
    date: "2024-01-20",
    status: "In Progress",
    lat: -30.7489,
    lng: 121.4658,
    assays: { Au: 5.1, Ag: 15.2 },
  },
  {
    id: "DH003",
    project: "Pilbara Iron",
    type: "RC",
    depth: 200,
    date: "2024-01-22",
    status: "Completed",
    lat: -22.7123,
    lng: 118.4567,
    assays: { Fe: 62.5 },
  },
  {
    id: "DH004",
    project: "Lithium Hills",
    type: "Diamond",
    depth: 450,
    date: "2024-02-01",
    status: "Planned",
    lat: -33.456,
    lng: 121.789,
    assays: null,
  },
];

// Mock rock sample data
const rockSampleData = [
  {
    id: "RS001",
    project: "Mount Magnet Gold",
    sampleType: "Grab",
    lithology: "Quartz vein",
    date: "2024-01-10",
    lat: -28.0556,
    lng: 117.8425,
    assays: { Au: 12.5, Ag: 8.2 },
  },
  {
    id: "RS002",
    project: "Tanami Project",
    sampleType: "Channel",
    lithology: "Banded iron formation",
    date: "2024-01-12",
    lat: -20.1234,
    lng: 130.5678,
    assays: { Au: 3.2, Cu: 0.8 },
  },
  {
    id: "RS003",
    project: "Kalgoorlie East",
    sampleType: "Chip",
    lithology: "Altered basalt",
    date: "2024-01-18",
    lat: -30.7489,
    lng: 121.4658,
    assays: { Au: 8.9, As: 450 },
  },
];

// Mock soil survey data
const soilSurveyData = [
  {
    id: "SS001",
    project: "Mount Magnet Gold",
    surveyType: "Grid",
    samples: 250,
    spacing: "100m x 50m",
    date: "2024-01-05",
    area: 2.5,
    anomalies: ["Au", "As"],
  },
  {
    id: "SS002",
    project: "Pilbara Iron",
    surveyType: "Reconnaissance",
    samples: 85,
    spacing: "500m x 200m",
    date: "2024-01-08",
    area: 15,
    anomalies: ["Fe", "Mn"],
  },
  {
    id: "SS003",
    project: "Lithium Hills",
    surveyType: "Infill",
    samples: 480,
    spacing: "50m x 25m",
    date: "2024-01-25",
    area: 1.2,
    anomalies: ["Li", "Cs", "Ta"],
  },
];

// Mock stream sediment data
const streamSurveyData = [
  {
    id: "ST001",
    project: "Mount Magnet Gold",
    catchment: "Magnet Creek",
    samples: 45,
    date: "2024-01-02",
    area: 25,
    anomalies: ["Au", "Cu", "As"],
  },
  {
    id: "ST002",
    project: "Tanami Project",
    catchment: "Dead Bullock Creek",
    samples: 32,
    date: "2024-01-06",
    area: 18,
    anomalies: ["Au", "W"],
  },
  {
    id: "ST003",
    project: "Kalgoorlie East",
    catchment: "Black Flag Creek",
    samples: 28,
    date: "2024-01-14",
    area: 12,
    anomalies: ["Au", "Ni", "Co"],
  },
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

// Drilling card component
const DrillingCard = ({ hole }: { hole: (typeof drillingData)[0] }) => (
  <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-red-500/50 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-white">{hole.id}</h3>
        <p className="text-sm text-gray-400">{hole.project}</p>
      </div>
      <StatusBadge status={hole.status} />
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
      <div className="flex items-center gap-1 text-gray-400">
        <Layers className="w-3 h-3" />
        <span>{hole.type}</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <span>{hole.depth}m depth</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <Calendar className="w-3 h-3" />
        <span>{hole.date}</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <MapPin className="w-3 h-3" />
        <span>
          {hole.lat.toFixed(2)}, {hole.lng.toFixed(2)}
        </span>
      </div>
    </div>
    {hole.assays && (
      <div className="flex flex-wrap gap-1">
        {Object.entries(hole.assays).map(([element, value]) => (
          <span
            key={element}
            className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded"
          >
            {element}: {value}
            {element === "Au" || element === "Ag" ? " g/t" : "%"}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Rock sample card component
const RockSampleCard = ({ sample }: { sample: (typeof rockSampleData)[0] }) => (
  <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-amber-500/50 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-white">{sample.id}</h3>
        <p className="text-sm text-gray-400">{sample.project}</p>
      </div>
      <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
        {sample.sampleType}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
      <div className="flex items-center gap-1 text-gray-400">
        <Mountain className="w-3 h-3" />
        <span>{sample.lithology}</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <Calendar className="w-3 h-3" />
        <span>{sample.date}</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-1">
      {Object.entries(sample.assays).map(([element, value]) => (
        <span
          key={element}
          className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded"
        >
          {element}: {value}
          {element === "Au" || element === "Ag" ? " g/t" : " ppm"}
        </span>
      ))}
    </div>
  </div>
);

// Soil survey card component
const SoilSurveyCard = ({
  survey,
}: {
  survey: (typeof soilSurveyData)[0];
}) => (
  <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-green-500/50 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-white">{survey.id}</h3>
        <p className="text-sm text-gray-400">{survey.project}</p>
      </div>
      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
        {survey.surveyType}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
      <div className="text-gray-400">
        <span className="text-white font-medium">{survey.samples}</span> samples
      </div>
      <div className="text-gray-400">
        <span className="text-white font-medium">{survey.area}</span> km²
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <Layers className="w-3 h-3" />
        <span>{survey.spacing}</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <Calendar className="w-3 h-3" />
        <span>{survey.date}</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-1">
      <span className="text-xs text-gray-500 mr-1">Anomalies:</span>
      {survey.anomalies.map((element) => (
        <span
          key={element}
          className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded"
        >
          {element}
        </span>
      ))}
    </div>
  </div>
);

// Stream survey card component
const StreamSurveyCard = ({
  survey,
}: {
  survey: (typeof streamSurveyData)[0];
}) => (
  <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-blue-500/50 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-white">{survey.id}</h3>
        <p className="text-sm text-gray-400">{survey.project}</p>
      </div>
      <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
        Stream
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
      <div className="col-span-2 flex items-center gap-1 text-gray-400">
        <Waves className="w-3 h-3" />
        <span>{survey.catchment}</span>
      </div>
      <div className="text-gray-400">
        <span className="text-white font-medium">{survey.samples}</span> samples
      </div>
      <div className="text-gray-400">
        <span className="text-white font-medium">{survey.area}</span> km²
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <Calendar className="w-3 h-3" />
        <span>{survey.date}</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-1">
      <span className="text-xs text-gray-500 mr-1">Anomalies:</span>
      {survey.anomalies.map((element) => (
        <span
          key={element}
          className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded"
        >
          {element}
        </span>
      ))}
    </div>
  </div>
);

export default function ExplorationPage() {
  const [activeType, setActiveType] = useState("drilling");
  const [showFilters, setShowFilters] = useState(false);

  // Stats summary
  const stats = {
    drilling: { count: drillingData.length, meters: 1120, active: 1 },
    rocks: { count: rockSampleData.length, total: 3 },
    soils: { count: soilSurveyData.length, samples: 815, area: 18.7 },
    streams: { count: streamSurveyData.length, samples: 105, area: 55 },
  };

  const renderContent = () => {
    switch (activeType) {
      case "drilling":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drillingData.map((hole) => (
              <DrillingCard key={hole.id} hole={hole} />
            ))}
          </div>
        );
      case "rocks":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rockSampleData.map((sample) => (
              <RockSampleCard key={sample.id} sample={sample} />
            ))}
          </div>
        );
      case "soils":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {soilSurveyData.map((survey) => (
              <SoilSurveyCard key={survey.id} survey={survey} />
            ))}
          </div>
        );
      case "streams":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streamSurveyData.map((survey) => (
              <StreamSurveyCard key={survey.id} survey={survey} />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const getActiveTypeData = () => {
    switch (activeType) {
      case "drilling":
        return {
          title: "Drilling Programs",
          subtitle: `${stats.drilling.count} holes • ${stats.drilling.meters}m total • ${stats.drilling.active} active`,
        };
      case "rocks":
        return {
          title: "Rock Samples",
          subtitle: `${stats.rocks.count} samples collected`,
        };
      case "soils":
        return {
          title: "Soil Surveys",
          subtitle: `${stats.soils.count} surveys • ${stats.soils.samples} samples • ${stats.soils.area} km²`,
        };
      case "streams":
        return {
          title: "Stream Sediments",
          subtitle: `${stats.streams.count} surveys • ${stats.streams.samples} samples • ${stats.streams.area} km²`,
        };
      default:
        return { title: "", subtitle: "" };
    }
  };

  const activeData = getActiveTypeData();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Exploration Data</h1>
              <p className="text-gray-400 text-sm">
                Manage all exploration activities across your projects
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                    : "border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Data
              </button>
            </div>
          </div>

          {/* Exploration Type Tabs */}
          <div className="flex items-center gap-2">
            {explorationTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? `${type.color} text-white shadow-lg`
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.name}
                  <span
                    className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      isActive ? "bg-white/20" : "bg-gray-700"
                    }`}
                  >
                    {type.id === "drilling" && stats.drilling.count}
                    {type.id === "rocks" && stats.rocks.count}
                    {type.id === "soils" && stats.soils.count}
                    {type.id === "streams" && stats.streams.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border-b border-gray-800 bg-gray-800/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Project
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
                  <option>All Projects</option>
                  <option>Mount Magnet Gold</option>
                  <option>Kalgoorlie East</option>
                  <option>Pilbara Iron</option>
                  <option>Lithium Hills</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Date Range
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
                  <option>All Time</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Status
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Planned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Commodity
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm">
                  <option>All Commodities</option>
                  <option>Gold (Au)</option>
                  <option>Iron (Fe)</option>
                  <option>Copper (Cu)</option>
                  <option>Lithium (Li)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">{activeData.title}</h2>
            <p className="text-sm text-gray-400">{activeData.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
              <Eye className="w-4 h-4" />
              View on Map
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Grid */}
        {renderContent()}
      </div>
    </div>
  );
}
