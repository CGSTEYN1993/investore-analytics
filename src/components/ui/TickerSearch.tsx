'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X } from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

interface CompanyResult {
  symbol: string;
  name: string;
  exchange?: string;
  primary_commodity?: string;
  country?: string;
}

interface TickerSearchProps {
  /** Optional className for the outer container. */
  className?: string;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Auto-focus the input on mount. */
  autoFocus?: boolean;
  /** Override navigation behaviour (default = push to /company/{ticker}). */
  onSelect?: (company: CompanyResult) => void;
}

/**
 * Global ticker / company search box with debounced autocomplete.
 *
 * - Hits GET /api/v1/spatial/companies?search=&page_size=10
 * - Pressing Enter on a 2-5 char uppercase string with no results still
 *   navigates to /company/{TICKER} so users can jump to any ticker.
 * - Arrow keys + Enter pick a suggestion; Escape closes.
 */
export default function TickerSearch({
  className = '',
  placeholder = 'Search ticker or company (e.g. BHP, Pilbara)…',
  autoFocus = false,
  onSelect,
}: TickerSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced fetch
  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setLoading(true);
        const res = await fetch(
          `${RAILWAY_API_URL}/api/v1/spatial/companies?search=${encodeURIComponent(q)}&page_size=10`,
          { signal: ctrl.signal },
        );
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        const items: CompanyResult[] = (data.companies || data.items || data || []).slice(0, 10);
        setResults(items);
        setHighlight(0);
        setOpen(true);
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(handle);
  }, [query]);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigateTo = (company: CompanyResult) => {
    if (onSelect) {
      onSelect(company);
      return;
    }
    const ticker = company.symbol.split('.')[0].toUpperCase();
    const exchange = company.exchange ? `?exchange=${encodeURIComponent(company.exchange)}` : '';
    router.push(`/company/${ticker}${exchange}`);
    setOpen(false);
    setQuery('');
  };

  const fallbackNavigate = () => {
    const q = query.trim().toUpperCase().replace(/\s+/g, '');
    if (/^[A-Z0-9]{2,6}$/.test(q)) {
      router.push(`/company/${q}`);
      setOpen(false);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlight]) {
        navigateTo(results[highlight]);
      } else {
        fallbackNavigate();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && (loading || results.length > 0 || query.trim().length > 0);

  const noResults = useMemo(
    () => !loading && open && query.trim().length > 0 && results.length === 0,
    [loading, open, query, results],
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-sm text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          aria-label="Search ticker or company"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-metallic-500 hover:text-metallic-200"
            aria-label="Clear"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full bg-metallic-900 border border-metallic-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          {loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-metallic-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching…
            </div>
          )}
          {noResults && (
            <div className="px-4 py-3 text-sm text-metallic-400">
              No matches.{' '}
              {/^[A-Z0-9]{2,6}$/.test(query.trim().toUpperCase()) && (
                <button
                  type="button"
                  onClick={fallbackNavigate}
                  className="text-primary-400 hover:text-primary-300 underline"
                >
                  Open /company/{query.trim().toUpperCase()} anyway
                </button>
              )}
            </div>
          )}
          {results.map((company, idx) => {
            const ticker = company.symbol.split('.')[0].toUpperCase();
            const isActive = idx === highlight;
            return (
              <button
                key={`${company.symbol}-${company.exchange ?? ''}`}
                type="button"
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => navigateTo(company)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 border-b border-metallic-800 last:border-b-0 transition-colors ${
                  isActive ? 'bg-metallic-800' : 'hover:bg-metallic-800/60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary-400">{ticker}</span>
                    {company.exchange && (
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 bg-metallic-800 border border-metallic-700 rounded text-metallic-400">
                        {company.exchange}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-metallic-300 truncate">{company.name}</div>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-[11px] text-metallic-500 shrink-0">
                  {company.primary_commodity && <span>{company.primary_commodity}</span>}
                  {company.country && <span>{company.country}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
