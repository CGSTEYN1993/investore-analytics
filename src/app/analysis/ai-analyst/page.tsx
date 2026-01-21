'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Send, Sparkles, FileText, MessageSquare,
  Target, AlertTriangle, Loader2, Database, Clock,
  ChevronDown, ChevronUp, Building2, TrendingUp, Copy,
  Check, RefreshCw, BarChart3, Shield, Zap
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';

// Types
interface SupportingData {
  table: string;
  field: string;
  value: string;
  record_id?: string;
  date?: string;
}

interface AnalystResponse {
  headline: string;
  interpretation: string;
  why_it_matters: string;
  supporting_data: SupportingData[];
  comparable_companies?: Record<string, unknown>[];
  risks_and_flags?: string[];
  confidence: string;
  confidence_reason: string;
  query_type: string;
}

interface ChatResponse {
  response: AnalystResponse;
  raw_sql_queries?: string[];
  processing_time_ms: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: AnalystResponse;
  processingTime?: number;
  timestamp: Date;
}

interface Capability {
  id: string;
  name: string;
  description: string;
  status: string;
}

// Suggested questions
const suggestedQuestions = [
  { 
    text: "What are the recent announcements for NEM?",
    icon: FileText,
    category: "Announcements"
  },
  {
    text: "Compare BHP and RIO on risk metrics",
    icon: Target,
    category: "Comparison"
  },
  {
    text: "Detect risk flags for FMG",
    icon: AlertTriangle,
    category: "Risk Detection"
  },
  {
    text: "Show me gold explorers on ASX",
    icon: MessageSquare,
    category: "Search"
  }
];

// Confidence badge colors
const confidenceColors: Record<string, string> = {
  high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function AIAnalystPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [llmEnabled, setLlmEnabled] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch capabilities on mount
  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/ai-analyst/capabilities`);
        if (res.ok) {
          const data = await res.json();
          setCapabilities(data.capabilities || []);
          setLlmEnabled(data.llm_enabled || false);
        }
      } catch (error) {
        console.error('Failed to fetch capabilities:', error);
      }
    };
    fetchCapabilities();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/ai-analyst/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.role === 'user' ? m.content : m.response?.headline || m.content
          }))
        })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data: ChatResponse = await res.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response.headline,
        response: data.response,
        processingTime: data.processing_time_ms,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      // Auto-expand the new message
      setExpandedMessages(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(assistantMessage.id);
        return newSet;
      });

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle message expansion
  const toggleExpand = (id: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-metallic-950 via-metallic-900 to-metallic-950">
      {/* Header */}
      <header className="border-b border-metallic-800 bg-metallic-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/analysis"
                className="flex items-center gap-2 text-metallic-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Analysis</span>
              </Link>
              <div className="h-6 w-px bg-metallic-700" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AI Research Analyst</h1>
                  <p className="text-xs text-metallic-400">
                    {llmEnabled ? 'GPT-4o Enhanced' : 'Rule-Based'} • Grounded in Database
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Powered by AI
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Capabilities */}
          <div className="lg:col-span-1 space-y-4">
            {/* Capabilities Card */}
            <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-metallic-200 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Capabilities
              </h3>
              <div className="space-y-2">
                {capabilities.map((cap) => (
                  <div
                    key={cap.id}
                    className="p-3 rounded-lg bg-metallic-800/30 border border-metallic-700/50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {cap.id === 'announcement_interpreter' && <FileText className="w-4 h-4 text-emerald-400" />}
                      {cap.id === 'natural_language_search' && <MessageSquare className="w-4 h-4 text-cyan-400" />}
                      {cap.id === 'valuation_explainer' && <Target className="w-4 h-4 text-purple-400" />}
                      {cap.id === 'risk_detection' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      <span className="text-sm font-medium text-metallic-200">{cap.name}</span>
                    </div>
                    <p className="text-xs text-metallic-400">{cap.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-metallic-200 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Data Sources
              </h3>
              <div className="space-y-1 text-xs text-metallic-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  ASX Announcements
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Companies Database
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Resource Estimates
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Drill Intercepts
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-400 mb-1">Disclaimer</h4>
                  <p className="text-xs text-metallic-400">
                    This AI provides analysis based on database records only. 
                    Not financial advice. Verify all data with primary sources.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl flex flex-col h-[calc(100vh-200px)]">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Ask me about mining companies
                    </h2>
                    <p className="text-metallic-400 max-w-md mb-6">
                      I can interpret announcements, compare companies, detect risks, 
                      and answer questions about your database.
                    </p>
                    
                    {/* Suggested Questions */}
                    <div className="grid grid-cols-2 gap-3 max-w-lg">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q.text)}
                          className="flex items-start gap-3 p-3 text-left rounded-lg bg-metallic-800/50 border border-metallic-700/50 hover:border-emerald-500/30 hover:bg-metallic-800 transition-colors group"
                        >
                          <q.icon className="w-4 h-4 text-metallic-400 group-hover:text-emerald-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs text-metallic-500 block">{q.category}</span>
                            <span className="text-sm text-metallic-200">{q.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl ${
                            message.role === 'user'
                              ? 'bg-emerald-600 text-white px-4 py-3'
                              : 'bg-metallic-800/50 border border-metallic-700/50 p-4'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <p>{message.content}</p>
                          ) : message.response ? (
                            <div className="space-y-3">
                              {/* Headline */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="font-semibold text-white">{message.response.headline}</p>
                                  {message.processingTime && (
                                    <span className="text-xs text-metallic-500 flex items-center gap-1 mt-1">
                                      <Clock className="w-3 h-3" />
                                      {message.processingTime}ms
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-xs rounded border ${confidenceColors[message.response.confidence]}`}>
                                    {message.response.confidence} confidence
                                  </span>
                                  <button
                                    onClick={() => toggleExpand(message.id)}
                                    className="p-1 hover:bg-metallic-700 rounded transition-colors"
                                  >
                                    {expandedMessages.has(message.id) ? (
                                      <ChevronUp className="w-4 h-4 text-metallic-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-metallic-400" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Content */}
                              {expandedMessages.has(message.id) && (
                                <div className="space-y-3 pt-3 border-t border-metallic-700/50">
                                  {/* Interpretation */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                                      What This Means
                                    </h4>
                                    <p className="text-sm text-metallic-300">{message.response.interpretation}</p>
                                  </div>

                                  {/* Why It Matters */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                                      Why It Matters
                                    </h4>
                                    <p className="text-sm text-metallic-300">{message.response.why_it_matters}</p>
                                  </div>

                                  {/* Supporting Data */}
                                  {message.response.supporting_data.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                                        Supporting Data
                                      </h4>
                                      <div className="space-y-1">
                                        {message.response.supporting_data.slice(0, 5).map((data, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-2 text-xs bg-metallic-900/50 rounded px-2 py-1"
                                          >
                                            <span className="text-metallic-500 font-mono">{data.table}.{data.field}</span>
                                            <span className="text-metallic-400">→</span>
                                            <span className="text-metallic-200 truncate flex-1">{String(data.value).slice(0, 60)}</span>
                                            {data.date && (
                                              <span className="text-metallic-500">({data.date})</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Risks */}
                                  {message.response.risks_and_flags && message.response.risks_and_flags.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
                                        Risks & Flags
                                      </h4>
                                      <ul className="space-y-1">
                                        {message.response.risks_and_flags.map((risk, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-sm text-metallic-300">
                                            <AlertTriangle className="w-3 h-3 text-red-400 mt-1 flex-shrink-0" />
                                            {risk}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Comparable Companies */}
                                  {message.response.comparable_companies && message.response.comparable_companies.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                                        Comparable Companies
                                      </h4>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                          <thead>
                                            <tr className="text-metallic-400 border-b border-metallic-700/50">
                                              <th className="text-left py-1 pr-3">Ticker</th>
                                              <th className="text-left py-1 pr-3">Name</th>
                                              <th className="text-left py-1 pr-3">Commodity</th>
                                              <th className="text-left py-1 pr-3">Risk</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {message.response.comparable_companies.map((comp, idx) => (
                                              <tr key={idx} className="text-metallic-200">
                                                <td className="py-1 pr-3 font-mono">{String(comp.ticker || '')}</td>
                                                <td className="py-1 pr-3">{String(comp.name || '')}</td>
                                                <td className="py-1 pr-3">{String(comp.commodity || '')}</td>
                                                <td className="py-1 pr-3">
                                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                                    comp.dilution_risk === 'high' ? 'bg-red-500/20 text-red-400' :
                                                    comp.dilution_risk === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                  }`}>
                                                    {String(comp.dilution_risk || 'low')}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {/* Confidence Reason */}
                                  <div className="text-xs text-metallic-500 italic">
                                    Confidence: {message.response.confidence_reason}
                                  </div>

                                  {/* Copy Button */}
                                  <button
                                    onClick={() => copyToClipboard(
                                      `${message.response?.headline}\n\n${message.response?.interpretation}\n\n${message.response?.why_it_matters}`,
                                      message.id
                                    )}
                                    className="flex items-center gap-1 text-xs text-metallic-400 hover:text-white transition-colors"
                                  >
                                    {copiedId === message.id ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        Copied!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        Copy response
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-metallic-200">{message.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-metallic-800/50 border border-metallic-700/50 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2 text-metallic-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analyzing database...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-metallic-700/50 p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask about companies, announcements, risks, comparisons..."
                      className="w-full px-4 py-3 bg-metallic-800 border border-metallic-700 rounded-xl text-white placeholder-metallic-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                      rows={2}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-metallic-500">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                  <span className="text-xs text-metallic-500">
                    {llmEnabled ? '🟢 LLM Active' : '🟡 Rule-Based Mode'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
