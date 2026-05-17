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
  DrillHoleDetail,
} from "@/services/miningData";

// Exploration data types
const explorationTypes = [
  { id: "drilling", name: "Drilling", icon: Drill, color: "bg-red-500" },
  { id: "intercepts", name: "Intercepts", icon: Target, color: "bg-amber-500" },
  { id: "rocks", name: "Rocks", icon: Mountain, color: "bg-purple-500" },
  { id: "soils", name: "Soils", icon: Droplets, color: "bg-green-500" },
  { id: "streams", name: "Streams", icon: Waves, color: "bg-blue-500" },
];

// Canonical grade unit per commodity. Used to (a) label the Min Grade filter,
// (b) restrict the filter to rows reported in the matching unit, and (c) pick
// a sensible default placeholder.
const COMMODITY_GRADE_UNITS: Record<string, { unit: string; placeholder: string }> = {
  Au:   { unit: "g/t", placeholder: "e.g., 1.0" },
  Ag:   { unit: "g/t", placeholder: "e.g., 30" },
  AuEq: { unit: "g/t", placeholder: "e.g., 1.0" },
  AgEq: { unit: "g/t", placeholder: "e.g., 30" },
  Pt:   { unit: "g/t", placeholder: "e.g., 1.0" },
  Pd:   { unit: "g/t", placeholder: "e.g., 1.0" },
  PGM:  { unit: "g/t", placeholder: "e.g., 1.0" },
  Cu:   { unit: "%",   placeholder: "e.g., 0.5" },
  Pb:   { unit: "%",   placeholder: "e.g., 1.0" },
  Zn:   { unit: "%",   placeholder: "e.g., 1.0" },
  Ni:   { unit: "%",   placeholder: "e.g., 0.5" },
  Co:   { unit: "%",   placeholder: "e.g., 0.05" },
  Sn:   { unit: "%",   placeholder: "e.g., 0.5" },
  W:    { unit: "%",   placeholder: "e.g., 0.2" },
  "Pb+Zn": { unit: "%", placeholder: "e.g., 2.0" },
  ZnEq: { unit: "%",   placeholder: "e.g., 2.0" },
  Li:   { unit: "%",   placeholder: "e.g., 0.5 (Li2O)" },
  Nb:   { unit: "%",   placeholder: "e.g., 0.3 (Nb2O5)" },
  REE:  { unit: "ppm", placeholder: "e.g., 1000 (TREO)" },
  Dy:   { unit: "ppm", placeholder: "e.g., 100" },
  Tb:   { unit: "ppm", placeholder: "e.g., 30" },
  U3O8: { unit: "ppm", placeholder: "e.g., 300" },
  U:    { unit: "ppm", placeholder: "e.g., 300" },
};

const getGradeUnitFor = (commodity: string | undefined | null) => {
  if (!commodity) return null;
  return COMMODITY_GRADE_UNITS[commodity] || null;
};

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
const DrillingCard = ({ hole, onOpen }: { hole: ExplorationDrilling; onOpen: (id: number) => void }) => {
  const projectLabel = hole.project_name || hole.target_zone;
  return (
    <button
      type="button"
      onClick={() => onOpen(hole.id)}
      className="text-left w-full bg-metallic-800/50 rounded-lg border border-metallic-700 p-4 hover:border-red-500/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-metallic-100 truncate">{hole.hole_id}</h3>
          <p className="text-sm text-accent-gold truncate">
            {hole.symbol}
            {hole.company_name && hole.company_name !== hole.symbol ? ` — ${hole.company_name}` : ""}
          </p>
          {projectLabel && (
            <p className="text-sm text-metallic-300 truncate">{projectLabel}</p>
          )}
          {hole.drill_purpose && (
            <p className="text-xs text-metallic-500 truncate">{hole.drill_purpose}</p>
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
    </button>
  );
};

// Drill hole detail modal
const DrillHoleDetailModal = ({
  holeId,
  highlightInterceptId,
  onClose,
}: {
  holeId: number | null;
  highlightInterceptId?: number | null;
  onClose: () => void;
}) => {
  const [detail, setDetail] = useState<DrillHoleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (holeId == null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);
    miningDataService
      .getDrillHoleDetail(holeId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((e) => { if (!cancelled) setError(String(e?.message || e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [holeId]);

  if (holeId == null) return null;

  const companyHref = detail
    ? `/company/${detail.symbol}${detail.exchange ? `?exchange=${encodeURIComponent(detail.exchange)}` : ""}`
    : "#";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-metallic-900 border border-metallic-700 rounded-xl shadow-2xl w-full max-w-4xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-metallic-800">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-metallic-100 truncate">
              {detail?.hole_id || "Drill hole"}
            </h2>
            {detail && (
              <div className="text-sm text-metallic-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <Link href={companyHref} className="text-accent-gold hover:underline">
                  {detail.symbol}{detail.company_name && detail.company_name !== detail.symbol ? ` — ${detail.company_name}` : ""}
                </Link>
                {detail.exchange && <span className="text-metallic-500">{detail.exchange}</span>}
                {(detail.project_name || detail.target_zone) && (
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {detail.project_name || detail.target_zone}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-metallic-400 hover:text-metallic-100 p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {loading && (
            <div className="text-sm text-metallic-400">Loading hole detail…</div>
          )}
          {error && (
            <div className="text-sm text-red-400">Failed to load: {error}</div>
          )}
          {detail && (
            <>
              {/* Key facts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <DetailStat label="Status" value={detail.status} />
                <DetailStat label="Type" value={detail.drill_type} />
                <DetailStat label="Total depth" value={detail.total_depth != null ? `${detail.total_depth.toFixed(1)} m` : null} />
                <DetailStat label="Precollar" value={detail.precollar_depth_m != null ? `${detail.precollar_depth_m.toFixed(1)} m` : null} />
                <DetailStat label="Azimuth" value={detail.azimuth != null ? `${detail.azimuth}°` : null} />
                <DetailStat label="Dip" value={detail.dip != null ? `${detail.dip}°` : null} />
                <DetailStat label="Easting" value={detail.easting != null ? detail.easting.toFixed(0) : null} />
                <DetailStat label="Northing" value={detail.northing != null ? detail.northing.toFixed(0) : null} />
                <DetailStat label="Elevation" value={detail.elevation != null ? `${detail.elevation} m RL` : null} />
                <DetailStat label="Coord system" value={detail.coordinate_system} />
                <DetailStat label="Drill date" value={detail.drill_date ? new Date(detail.drill_date).toLocaleDateString() : null} />
                <DetailStat label="Announced" value={detail.announcement_date ? new Date(detail.announcement_date).toLocaleDateString() : null} />
                <DetailStat label="Purpose" value={detail.drill_purpose} />
                <DetailStat label="Target zone" value={detail.target_zone} />
                <DetailStat label="Confidence" value={detail.confidence != null ? `${(detail.confidence * 100).toFixed(0)}%` : null} />
              </div>

              {/* Intercepts */}
              <div>
                <h3 className="text-sm font-semibold text-metallic-100 mb-2 flex items-center gap-2">
                  <Gem className="w-4 h-4 text-amber-400" />
                  Significant intercepts
                  <span className="text-metallic-500 font-normal">({detail.intercepts.length})</span>
                </h3>
                {detail.intercepts.length === 0 ? (
                  <p className="text-sm text-metallic-500">No intercepts recorded for this hole.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-metallic-800">
                    <table className="w-full text-sm">
                      <thead className="bg-metallic-800/60 text-metallic-400 text-xs uppercase">
                        <tr>
                          <th className="text-left px-3 py-2">From</th>
                          <th className="text-left px-3 py-2">To</th>
                          <th className="text-left px-3 py-2">Width</th>
                          <th className="text-left px-3 py-2">True width</th>
                          <th className="text-left px-3 py-2">Commodity</th>
                          <th className="text-left px-3 py-2">Grade</th>
                          <th className="text-left px-3 py-2">Contained</th>
                          <th className="text-left px-3 py-2">Cutoff</th>
                        </tr>
                      </thead>
                      <tbody className="text-metallic-200">
                        {detail.intercepts.map((i) => (
                          <tr
                            key={i.id}
                            className={`border-t border-metallic-800 ${highlightInterceptId === i.id ? "bg-amber-500/10 ring-1 ring-amber-500/40" : ""}`}
                          >
                            <td className="px-3 py-2">{i.from_m != null ? `${i.from_m.toFixed(1)} m` : "—"}</td>
                            <td className="px-3 py-2">{i.to_m != null ? `${i.to_m.toFixed(1)} m` : "—"}</td>
                            <td className="px-3 py-2">{i.interval_m != null ? `${i.interval_m.toFixed(1)} m` : "—"}</td>
                            <td className="px-3 py-2">{i.true_width_m != null ? `${i.true_width_m.toFixed(1)} m` : "—"}</td>
                            <td className="px-3 py-2 font-medium">{i.commodity}</td>
                            <td className="px-3 py-2">{i.grade != null ? `${i.grade} ${i.grade_unit}` : "—"}</td>
                            <td className="px-3 py-2">{i.contained_metal != null ? `${i.contained_metal} ${i.contained_metal_unit || ""}` : "—"}</td>
                            <td className="px-3 py-2">{i.cutoff_grade != null ? `${i.cutoff_grade} ${i.cutoff_unit || ""}` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Source document */}
              {detail.document && (
                <div>
                  <h3 className="text-sm font-semibold text-metallic-100 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Source announcement
                  </h3>
                  <div className="bg-metallic-800/50 border border-metallic-700 rounded-lg p-3 text-sm">
                    <div className="text-metallic-200">{detail.document.title || detail.document.document_id}</div>
                    {detail.document.pdf_url && (
                      <a
                        href={detail.document.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-accent-gold hover:underline"
                      >
                        Open source PDF
                        {detail.document.num_pages ? <span className="text-metallic-500">({detail.document.num_pages} pages)</span> : null}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-metallic-800 flex items-center justify-between text-sm">
                <Link href={companyHref} className="text-accent-gold hover:underline">
                  View {detail.symbol} company page →
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg border border-metallic-700 text-metallic-300 hover:border-metallic-500"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailStat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="bg-metallic-800/40 rounded-md px-3 py-2 border border-metallic-800">
    <div className="text-[10px] uppercase text-metallic-500 tracking-wide">{label}</div>
    <div className="text-metallic-100 truncate">{value ?? <span className="text-metallic-600">—</span>}</div>
  </div>
);

// Intercept card component
const InterceptCard = ({
  intercept,
  onOpen,
}: {
  intercept: DrillIntercept;
  onOpen?: (holeId: number, interceptId: number) => void;
}) => {
  const canOpen = onOpen != null && intercept.drilling_result_id != null;
  const handleClick = () => {
    if (canOpen && intercept.drilling_result_id != null) {
      onOpen!(intercept.drilling_result_id, intercept.id);
    }
  };
  return (
  <div
    onClick={canOpen ? handleClick : undefined}
    role={canOpen ? "button" : undefined}
    tabIndex={canOpen ? 0 : undefined}
    onKeyDown={canOpen ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } } : undefined}
    className={`bg-metallic-800/50 rounded-lg border border-metallic-700 p-4 transition-colors ${canOpen ? "cursor-pointer hover:border-amber-500/50 hover:bg-metallic-800/80" : "hover:border-amber-500/50"}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-metallic-100">
          {intercept.hole_id && intercept.hole_id !== 'Unknown' 
            ? intercept.hole_id 
            : intercept.project_name || `${intercept.symbol} Intercept`}
        </h3>
        <div className="flex items-center gap-2">
          <Link 
            href={`/company/${intercept.symbol}`}
            className="text-sm text-accent-gold hover:underline"
          >
            {intercept.symbol}
          </Link>
          {intercept.project_name && intercept.hole_id !== 'Unknown' && (
            <span className="text-xs text-metallic-500">• {intercept.project_name}</span>
          )}
        </div>
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

    {canOpen && (
      <div className="mt-3 pt-3 border-t border-metallic-700 text-xs text-accent-gold">
        View hole detail & source PDF →
      </div>
    )}
  </div>
  );
};

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
  const [selectedHoleId, setSelectedHoleId] = useState<number | null>(null);
  const [highlightInterceptId, setHighlightInterceptId] = useState<number | null>(null);
  
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
          gradeUnit: selectedCommodity ? getGradeUnitFor(selectedCommodity)?.unit : undefined,
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
              <DrillingCard key={`${hole.symbol}-${hole.hole_id}-${hole.id}`} hole={hole} onOpen={setSelectedHoleId} />
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
              <InterceptCard
                key={`${intercept.symbol}-${intercept.hole_id}-${intercept.id}`}
                intercept={intercept}
                onOpen={(holeId, interceptId) => {
                  setHighlightInterceptId(interceptId);
                  setSelectedHoleId(holeId);
                }}
              />
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
        <div className="max-w-[1800px] mx-auto px-4 py-4">
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

      <div className="max-w-[1800px] mx-auto px-4 py-6">
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
                    onChange={(e) => {
                      setSelectedCommodity(e.target.value);
                      // Reset stale min-grade value when switching units (Au g/t -> Cu %).
                      setMinGrade(undefined);
                    }}
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
                {(() => {
                  const gu = getGradeUnitFor(selectedCommodity);
                  const unitLabel = gu?.unit ?? "select commodity";
                  const placeholder = gu?.placeholder ?? "Pick a commodity first";
                  const disabled = !selectedCommodity;
                  return (
                    <>
                      <label className="block text-xs text-metallic-500 mb-1.5 uppercase tracking-wide">
                        Min Grade ({unitLabel})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={minGrade ?? ""}
                        onChange={(e) => setMinGrade(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={placeholder}
                        disabled={disabled}
                        title={disabled ? "Select a commodity to filter by grade (units differ: Au is g/t, Cu is %, U3O8 is ppm)" : undefined}
                        className={`w-full bg-metallic-900 border border-metallic-700 rounded-lg px-3 py-2 text-sm text-metallic-100 focus:border-accent-gold focus:outline-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      />
                      {!disabled && gu && (
                        <div className="text-[10px] text-metallic-500 mt-1">
                          Filtered against intercepts reported in {gu.unit}.
                        </div>
                      )}
                    </>
                  );
                })()}
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
                  <FilterBadge label={`Min Grade: ${minGrade} ${getGradeUnitFor(selectedCommodity)?.unit ?? ""}`.trim()} onClear={() => setMinGrade(undefined)} />
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
                    gradeUnit: selectedCommodity ? getGradeUnitFor(selectedCommodity)?.unit : undefined,
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

      <DrillHoleDetailModal
        holeId={selectedHoleId}
        highlightInterceptId={highlightInterceptId}
        onClose={() => { setSelectedHoleId(null); setHighlightInterceptId(null); }}
      />
    </div>
  );
}
