"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface KnowledgeSection {
  title: string;
  data: Record<string, unknown>;
}

interface KnowledgeResponse {
  title: string;
  description: string;
  sections: Record<string, KnowledgeSection>;
  sources: string[];
}

export default function MiningEconomicsPage() {
  const [knowledge, setKnowledge] = useState<KnowledgeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resource_classification");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://web-production-4faa7.up.railway.app";
        const res = await fetch(`${API_BASE}/api/v1/ai-analyst/knowledge/reference`);
        if (!res.ok) throw new Error("Failed to fetch knowledge base");
        const data = await res.json();
        setKnowledge(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchKnowledge();
  }, []);

  const tabs = [
    { id: "resource_classification", label: "Resource Classification" },
    { id: "valuation_methods", label: "Valuation Methods" },
    { id: "drilling_interpretation", label: "Drilling Interpretation" },
    { id: "metallurgy", label: "Metallurgy" },
    { id: "cost_benchmarks", label: "Cost Benchmarks" },
    { id: "lassonde_curve", label: "Lassonde Curve" },
    { id: "risk_factors", label: "Risk Factors" },
    { id: "formulas", label: "Formulas" },
  ];

  const renderValue = (value: unknown, depth: number = 0): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400">-</span>;
    
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return <span className="text-gray-200">{String(value)}</span>;
    }
    
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside ml-4 space-y-1">
          {value.map((item, idx) => (
            <li key={idx} className="text-gray-300 text-sm">{renderValue(item, depth + 1)}</li>
          ))}
        </ul>
      );
    }
    
    if (typeof value === "object") {
      return (
        <div className={`${depth > 0 ? "ml-4 mt-2" : ""} space-y-2`}>
          {Object.entries(value as Record<string, unknown>).map(([key, val]) => (
            <div key={key} className="border-l-2 border-gray-700 pl-3">
              <span className="text-amber-400 font-medium text-sm capitalize">
                {key.replace(/_/g, " ")}:
              </span>
              <div className="mt-1">{renderValue(val, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (error || !knowledge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Mining Economics Reference</h1>
          <p className="text-red-400">{error || "Failed to load knowledge base"}</p>
          <Link href="/" className="text-amber-400 hover:underline mt-4 inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const activeSection = knowledge.sections[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-amber-400 hover:underline text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">{knowledge.title}</h1>
          <p className="text-gray-400 mt-2">{knowledge.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-slate-800/50 rounded-xl p-4 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Topics</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                      activeTab === tab.id
                        ? "bg-amber-500/20 text-amber-400 border-l-2 border-amber-400"
                        : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-slate-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
                {activeSection?.title}
              </h2>
              
              <div className="space-y-6">
                {activeSection?.data && renderValue(activeSection.data)}
              </div>
            </div>

            {/* Sources */}
            <div className="mt-8 bg-slate-800/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Reference Sources</h3>
              <ul className="space-y-2">
                {knowledge.sources.map((source, idx) => (
                  <li key={idx} className="text-gray-400 text-sm flex items-start">
                    <span className="text-amber-400 mr-2">•</span>
                    {source}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Educational Purpose:</strong> This reference guide is for educational purposes only 
                and should not be considered investment advice. Always consult qualified professionals 
                and conduct thorough due diligence before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
