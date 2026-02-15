'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Users, Plus, Trash2, Edit2, BarChart3,
  Loader2, Search, Filter, Building2, Globe, TrendingUp
} from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_BASE = RAILWAY_API_URL;

interface PeerSet {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  company_count: number;
  commodities: string[];
}

export default function PeersPage() {
  const router = useRouter();
  const [peerSets, setPeerSets] = useState<PeerSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');

  useEffect(() => {
    fetchPeerSets();
  }, []);

  const fetchPeerSets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/peers/sets`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setPeerSets(data.peer_sets || []);
      }
    } catch (error) {
      console.error('Failed to fetch peer sets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSet = async () => {
    if (!newSetName.trim()) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/v1/peers/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newSetName,
          description: newSetDescription,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setShowCreateModal(false);
        setNewSetName('');
        setNewSetDescription('');
        // Navigate to the new peer set
        router.push(`/peers/${data.id}/charts`);
      }
    } catch (error) {
      console.error('Failed to create peer set:', error);
    }
  };

  const handleDeleteSet = async (id: number) => {
    if (!confirm('Are you sure you want to delete this peer set?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/v1/peers/sets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (res.ok) {
        setPeerSets(prev => prev.filter(ps => ps.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete peer set:', error);
    }
  };

  const filteredSets = peerSets.filter(ps =>
    ps.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ps.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Peer Groups</h1>
                  <p className="text-xs text-metallic-400">
                    Build and compare mining company peer sets
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Peer Set
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-metallic-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search peer sets..."
              className="w-full pl-10 pr-4 py-3 bg-metallic-800/50 border border-metallic-700 rounded-xl text-white placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Peer Sets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : filteredSets.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-metallic-300 mb-2">
              No Peer Sets Found
            </h3>
            <p className="text-metallic-500 mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first peer set to start comparing companies'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Peer Set
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSets.map((peerSet) => (
              <div
                key={peerSet.id}
                className="bg-metallic-800/50 border border-metallic-700/50 rounded-xl p-6 hover:border-emerald-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{peerSet.name}</h3>
                      <p className="text-xs text-metallic-500">
                        {peerSet.company_count} companies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteSet(peerSet.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded text-metallic-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {peerSet.description && (
                  <p className="text-sm text-metallic-400 mb-4 line-clamp-2">
                    {peerSet.description}
                  </p>
                )}

                {peerSet.commodities && peerSet.commodities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {peerSet.commodities.slice(0, 4).map((comm, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-metallic-700/50 text-metallic-300 text-xs rounded"
                      >
                        {comm}
                      </span>
                    ))}
                    {peerSet.commodities.length > 4 && (
                      <span className="px-2 py-0.5 text-metallic-500 text-xs">
                        +{peerSet.commodities.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-metallic-700/50">
                  <Link
                    href={`/peers/${peerSet.id}/charts`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-all text-sm font-medium"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Charts
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-metallic-900 border border-metallic-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create Peer Set</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-metallic-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="e.g., Gold Explorers ASX"
                  className="w-full px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-white placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-metallic-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newSetDescription}
                  onChange={(e) => setNewSetDescription(e.target.value)}
                  placeholder="Brief description of this peer group..."
                  rows={3}
                  className="w-full px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-white placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-metallic-600 text-metallic-300 rounded-lg hover:bg-metallic-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSet}
                disabled={!newSetName.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
