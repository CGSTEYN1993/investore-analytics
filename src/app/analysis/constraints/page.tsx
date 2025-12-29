"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Landmark,
  Users,
  TreePine,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  Filter,
  Download,
  Plus,
  Search,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";

// Constraint types with full details
const constraintTypes = {
  heritage: {
    id: "heritage",
    name: "Heritage",
    color: "#f59e0b",
    bgColor: "bg-amber-500",
    textColor: "text-amber-400",
    borderColor: "border-amber-500",
    icon: Landmark,
    description: "Cultural, archaeological, and historical sites",
  },
  social: {
    id: "social",
    name: "Social",
    color: "#8b5cf6",
    bgColor: "bg-purple-500",
    textColor: "text-purple-400",
    borderColor: "border-purple-500",
    icon: Users,
    description: "Indigenous lands, native title, and community areas",
  },
  environmental: {
    id: "environmental",
    name: "Environmental",
    color: "#10b981",
    bgColor: "bg-emerald-500",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500",
    icon: TreePine,
    description: "Protected areas, conservation zones, and ecological reserves",
  },
};

// Mock constraint areas data
const constraintAreas = [
  {
    id: "C001",
    name: "Sacred Dreaming Site",
    type: "heritage" as const,
    tenement: "E45/1234",
    project: "Mount Magnet Gold",
    lat: -28.1,
    lng: 117.9,
    area: 2.5,
    status: "No-go",
    restrictions: ["No ground disturbance", "No drilling within 500m"],
    expiryDate: null,
    createdDate: "2020-03-15",
    lastReview: "2024-06-01",
    documents: ["Heritage Survey Report 2020", "Cultural Assessment"],
    contacts: ["Aboriginal Affairs WA", "Traditional Owners Group"],
  },
  {
    id: "C002",
    name: "Wetland Conservation Zone",
    type: "environmental" as const,
    tenement: "M77/5678",
    project: "Pilbara Iron",
    lat: -22.4,
    lng: 118.5,
    area: 15.2,
    status: "Restricted",
    restrictions: [
      "Seasonal access only (May-Oct)",
      "No water extraction",
      "Environmental Management Plan required",
    ],
    expiryDate: "2027-12-31",
    createdDate: "2019-08-20",
    lastReview: "2024-01-15",
    documents: ["EPA Determination 2019", "Annual Monitoring Report 2024"],
    contacts: ["Department of Environment", "EPA WA"],
  },
  {
    id: "C003",
    name: "Indigenous Community Reserve",
    type: "social" as const,
    tenement: "E45/1234",
    project: "Mount Magnet Gold",
    lat: -28.0,
    lng: 117.7,
    area: 8.0,
    status: "Conditional",
    restrictions: [
      "Heritage survey required before any works",
      "Community consultation mandatory",
      "Local employment targets (30%)",
    ],
    expiryDate: null,
    createdDate: "2018-11-10",
    lastReview: "2024-03-20",
    documents: ["Native Title Agreement 2018", "Community Benefit Scheme"],
    contacts: ["Native Title Representative Body", "Community Council"],
  },
  {
    id: "C004",
    name: "Rare Flora Habitat",
    type: "environmental" as const,
    tenement: "P45/9012",
    project: "Lithium Hills",
    lat: -33.5,
    lng: 121.8,
    area: 4.3,
    status: "No-go",
    restrictions: ["No clearing permitted", "200m buffer zone required"],
    expiryDate: null,
    createdDate: "2021-05-25",
    lastReview: "2024-05-25",
    documents: ["Flora Survey 2021", "DEC Conservation Order"],
    contacts: ["Department of Conservation", "Botanical Gardens WA"],
  },
  {
    id: "C005",
    name: "Historic Mining Heritage Site",
    type: "heritage" as const,
    tenement: "M15/3456",
    project: "Kalgoorlie East",
    lat: -30.8,
    lng: 121.5,
    area: 1.2,
    status: "Restricted",
    restrictions: [
      "Archaeological assessment required",
      "Preservation of historic structures",
      "Documentation of any modifications",
    ],
    expiryDate: null,
    createdDate: "2017-02-14",
    lastReview: "2023-11-30",
    documents: ["Heritage Register Entry", "Archaeological Survey 2017"],
    contacts: ["Heritage Council WA", "National Trust"],
  },
  {
    id: "C006",
    name: "Water Catchment Protection Area",
    type: "environmental" as const,
    tenement: "E51/2345",
    project: "Tanami Project",
    lat: -20.2,
    lng: 130.6,
    area: 25.0,
    status: "Conditional",
    restrictions: [
      "Water quality monitoring required",
      "Spill prevention plan mandatory",
      "No tailings disposal within boundary",
    ],
    expiryDate: "2030-06-30",
    createdDate: "2020-06-30",
    lastReview: "2024-06-30",
    documents: ["Water Management Plan", "Monitoring Protocol"],
    contacts: ["Water Corporation", "Department of Water"],
  },
  {
    id: "C007",
    name: "Native Title Determination Area",
    type: "social" as const,
    tenement: "E77/8901",
    project: "Pilbara Iron",
    lat: -22.2,
    lng: 118.7,
    area: 45.0,
    status: "Conditional",
    restrictions: [
      "Native title agreement required",
      "Cultural heritage clearance before works",
      "Benefit sharing obligations",
    ],
    expiryDate: null,
    createdDate: "2016-09-08",
    lastReview: "2024-04-15",
    documents: ["ILUA Agreement", "Heritage Protocol"],
    contacts: ["Prescribed Body Corporate", "NNTT"],
  },
];

// Status configuration
const statusConfig = {
  "No-go": {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: XCircle,
    description: "No exploration or mining activity permitted",
  },
  Restricted: {
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: AlertTriangle,
    description: "Activity permitted with specific conditions",
  },
  Conditional: {
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: CheckCircle,
    description: "Activity permitted subject to approvals",
  },
};

// Constraint Card Component
function ConstraintCard({
  constraint,
  onSelect,
}: {
  constraint: (typeof constraintAreas)[0];
  onSelect: (c: (typeof constraintAreas)[0]) => void;
}) {
  const typeInfo = constraintTypes[constraint.type];
  const TypeIcon = typeInfo.icon;
  const statusInfo = statusConfig[constraint.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={`bg-gray-800/50 rounded-xl border border-gray-700 p-5 hover:border-opacity-100 transition-all cursor-pointer`}
      style={{ borderColor: `${typeInfo.color}40` }}
      onClick={() => onSelect(constraint)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${typeInfo.color}30` }}
          >
            <TypeIcon className="w-5 h-5" style={{ color: typeInfo.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{constraint.name}</h3>
            <p className="text-sm text-gray-400">{constraint.id}</p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          {constraint.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div className="flex items-center gap-2 text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{constraint.project}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <FileText className="w-4 h-4" />
          <span>{constraint.tenement}</span>
        </div>
        <div className="text-gray-400">
          <span className="text-white font-medium">{constraint.area}</span> km²
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{constraint.lastReview}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {constraint.restrictions.slice(0, 2).map((r, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-xs bg-gray-700/50 text-gray-300 rounded"
          >
            {r.length > 30 ? r.substring(0, 30) + "..." : r}
          </span>
        ))}
        {constraint.restrictions.length > 2 && (
          <span className="px-2 py-0.5 text-xs bg-gray-700/50 text-gray-400 rounded">
            +{constraint.restrictions.length - 2} more
          </span>
        )}
      </div>
    </div>
  );
}

// Constraint Detail Modal
function ConstraintDetailModal({
  constraint,
  onClose,
}: {
  constraint: (typeof constraintAreas)[0];
  onClose: () => void;
}) {
  const typeInfo = constraintTypes[constraint.type];
  const TypeIcon = typeInfo.icon;
  const statusInfo = statusConfig[constraint.status as keyof typeof statusConfig];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="p-6 border-b border-gray-700"
          style={{ backgroundColor: `${typeInfo.color}10` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${typeInfo.color}30` }}
              >
                <TypeIcon className="w-7 h-7" style={{ color: typeInfo.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${typeInfo.color}30`,
                      color: typeInfo.color,
                    }}
                  >
                    {typeInfo.name.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{constraint.id}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{constraint.name}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Location */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${statusInfo.color}`}
              >
                {constraint.status}
              </span>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Area</p>
              <p className="text-sm font-medium text-white">{constraint.area} km²</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Tenement</p>
              <p className="text-sm font-medium text-white">{constraint.tenement}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Project</p>
              <p className="text-sm font-medium text-white">{constraint.project}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm text-white">{constraint.createdDate}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Last Review</p>
              <p className="text-sm text-white">{constraint.lastReview}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">
                {constraint.expiryDate ? "Expires" : "Expiry"}
              </p>
              <p className="text-sm text-white">
                {constraint.expiryDate || "Permanent"}
              </p>
            </div>
          </div>

          {/* Restrictions */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Restrictions & Conditions
            </h3>
            <ul className="space-y-2">
              {constraint.restrictions.map((restriction, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300">{restriction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Associated Documents
            </h3>
            <div className="space-y-2">
              {constraint.documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{doc}</span>
                  </div>
                  <button className="text-xs text-primary-400 hover:text-primary-300">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Key Contacts
            </h3>
            <div className="flex flex-wrap gap-2">
              {constraint.contacts.map((contact, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg"
                >
                  {contact}
                </span>
              ))}
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Coordinates</p>
                  <p className="text-sm font-mono text-white">
                    {constraint.lat.toFixed(4)}°, {constraint.lng.toFixed(4)}°
                  </p>
                </div>
              </div>
              <Link
                href="/analysis/map"
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View on Map
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              <Edit className="w-4 h-4" />
              Edit Constraint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConstraintsPage() {
  const [activeType, setActiveType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConstraint, setSelectedConstraint] = useState<
    (typeof constraintAreas)[0] | null
  >(null);

  // Filter constraints
  const filteredConstraints = constraintAreas.filter((c) => {
    const matchesType = activeType === "all" || c.type === activeType;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tenement.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: constraintAreas.length,
    noGo: constraintAreas.filter((c) => c.status === "No-go").length,
    restricted: constraintAreas.filter((c) => c.status === "Restricted").length,
    conditional: constraintAreas.filter((c) => c.status === "Conditional").length,
    totalArea: constraintAreas.reduce((acc, c) => acc + c.area, 0),
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-md text-sm text-gray-300 hover:text-gray-100 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/analysis" className="hover:text-primary-400">
              Analysis
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">Legal Constraints</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7 text-amber-500" />
                Legal Constraints
              </h1>
              <p className="text-gray-400 text-sm">
                Manage areas with exploration and mining restrictions within tenements
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Constraint
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Constraints</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-red-400">No-go Zones</p>
              <p className="text-xl font-bold text-red-400">{stats.noGo}</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-400">Restricted</p>
              <p className="text-xl font-bold text-amber-400">{stats.restricted}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-xs text-green-400">Conditional</p>
              <p className="text-xl font-bold text-green-400">{stats.conditional}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Area</p>
              <p className="text-xl font-bold">{stats.totalArea.toFixed(1)} km²</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search constraints, projects, tenements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
            >
              <option value="all">All Status</option>
              <option value="No-go">No-go</option>
              <option value="Restricted">Restricted</option>
              <option value="Conditional">Conditional</option>
            </select>
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveType("all")}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeType === "all"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              All Types
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-600 rounded-full">
                {constraintAreas.length}
              </span>
            </button>
            {Object.values(constraintTypes).map((type) => {
              const Icon = type.icon;
              const count = constraintAreas.filter((c) => c.type === type.id).length;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeType === type.id
                      ? `${type.bgColor} text-white`
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.name}
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      activeType === type.id ? "bg-white/20" : "bg-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConstraints.map((constraint) => (
            <ConstraintCard
              key={constraint.id}
              constraint={constraint}
              onSelect={setSelectedConstraint}
            />
          ))}
        </div>

        {filteredConstraints.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">No constraints found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedConstraint && (
        <ConstraintDetailModal
          constraint={selectedConstraint}
          onClose={() => setSelectedConstraint(null)}
        />
      )}
    </div>
  );
}
