'use client';

/**
 * HoldingsDrawer
 *
 * Side drawer shown over the Analysis Dashboard when the user clicks
 * Portfolio or Watchlist in the dashboard header. Lets the user view
 * (and click straight through to) any holding without leaving the
 * analysis context — i.e. without bouncing into the trading platform.
 *
 * - Two tabs: Portfolio (live IB positions via /api/v1/portfolio/overview)
 *   and Watchlist (user-defined lists via /api/v1/watchlist*).
 * - Every row is a link to /company/{TICKER}?exchange=XXX so the user
 *   stays inside the research / analysis surface.
 * - Falls back gracefully when not signed in or when the IB agent is
 *   offline (data_source = "unavailable").
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  X, Briefcase, Bookmark, ExternalLink, RefreshCw,
  TrendingUp, TrendingDown, AlertCircle, Loader2, Search, Trash2,
} from 'lucide-react';
import {
  fetchPortfolioOverview,
  fetchWatchlists,
  fetchWatchlistQuotes,
  type PortfolioOverview,
  type Watchlist,
  type WatchlistQuotes,
  type Timeframe,
} from '@/services/tradingService';
import { useAnalysisWatchlist } from '@/hooks/useAnalysisWatchlist';
import TickerSearch from '@/components/ui/TickerSearch';

export type HoldingsTab = 'portfolio' | 'watchlist';

interface Props {
  open: boolean;
  initialTab?: HoldingsTab;
  onClose: () => void;
}

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y'];

const fmtMoney = (v: number | null | undefined) =>
  v == null ? '—'
    : `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtPct = (v: number | null | undefined) =>
  v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

const pctColor = (v: number | null | undefined) =>
  v == null ? 'text-metallic-400' : v > 0 ? 'text-emerald-400' : v < 0 ? 'text-rose-400' : 'text-metallic-400';

export default function HoldingsDrawer({ open, initialTab = 'portfolio', onClose }: Props) {
  const [tab, setTab] = useState<HoldingsTab>(initialTab);
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');

  // Portfolio
  const [portfolio, setPortfolio] = useState<PortfolioOverview | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  // Watchlists
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<number | null>(null);
  const [watchlistQuotes, setWatchlistQuotes] = useState<WatchlistQuotes | null>(null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);

  // Sync the tab when caller re-opens with a different initialTab.
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const loadPortfolio = useCallback(async () => {
    setPortfolioLoading(true);
    setPortfolioError(null);
    try {
      const data = await fetchPortfolioOverview(timeframe);
      setPortfolio(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load portfolio';
      setPortfolioError(msg);
      setPortfolio(null);
    } finally {
      setPortfolioLoading(false);
    }
  }, [timeframe]);

  const loadWatchlists = useCallback(async () => {
    setWatchlistLoading(true);
    setWatchlistError(null);
    try {
      const lists = await fetchWatchlists();
      setWatchlists(lists);
      const nextId = activeWatchlistId
        ?? lists.find(w => w.is_default)?.id
        ?? lists[0]?.id
        ?? null;
      setActiveWatchlistId(nextId);
      if (nextId != null) {
        const quotes = await fetchWatchlistQuotes(nextId, timeframe);
        setWatchlistQuotes(quotes);
      } else {
        setWatchlistQuotes(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load watchlists';
      setWatchlistError(msg);
      setWatchlists([]);
      setWatchlistQuotes(null);
    } finally {
      setWatchlistLoading(false);
    }
  }, [activeWatchlistId, timeframe]);

  const loadWatchlistQuotes = useCallback(async (id: number) => {
    setWatchlistLoading(true);
    setWatchlistError(null);
    try {
      const quotes = await fetchWatchlistQuotes(id, timeframe);
      setWatchlistQuotes(quotes);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load watchlist';
      setWatchlistError(msg);
      setWatchlistQuotes(null);
    } finally {
      setWatchlistLoading(false);
    }
  }, [timeframe]);

  // Fetch when drawer opens / tab / timeframe change.
  useEffect(() => {
    if (!open) return;
    if (tab === 'portfolio') loadPortfolio();
    // Watchlist tab now reads from local useAnalysisWatchlist store — no fetch needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, timeframe]);

  // Re-fetch quotes when user picks a different watchlist.
  useEffect(() => {
    if (!open || tab !== 'watchlist' || activeWatchlistId == null) return;
    loadWatchlistQuotes(activeWatchlistId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWatchlistId]);

  const portfolioRows = useMemo(() => portfolio?.positions ?? [], [portfolio]);
  const watchlistRows = useMemo(() => watchlistQuotes?.items ?? [], [watchlistQuotes]);

  const dataUnavailable = (source?: string) => source === 'unavailable';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Holdings"
        className="relative ml-auto w-full max-w-2xl h-full bg-metallic-950 border-l border-metallic-800 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-metallic-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-metallic-100">My Holdings</h2>
            <span className="text-xs text-metallic-500">— stay in analysis, no trading platform</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-metallic-400 hover:text-metallic-100 hover:bg-metallic-800 transition"
            aria-label="Close holdings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3">
          <button
            onClick={() => setTab('portfolio')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium transition ${
              tab === 'portfolio'
                ? 'bg-metallic-900 text-metallic-100 border-b-2 border-primary-400'
                : 'text-metallic-400 hover:text-metallic-200'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Portfolio
          </button>
          <button
            onClick={() => setTab('watchlist')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium transition ${
              tab === 'watchlist'
                ? 'bg-metallic-900 text-metallic-100 border-b-2 border-primary-400'
                : 'text-metallic-400 hover:text-metallic-200'
            }`}
          >
            <Bookmark className="w-4 h-4" /> Watchlist
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex bg-metallic-900 rounded-lg p-0.5">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 text-xs rounded-md transition ${
                    timeframe === tf
                      ? 'bg-metallic-700 text-metallic-100'
                      : 'text-metallic-400 hover:text-metallic-100'
                  }`}
                >{tf}</button>
              ))}
            </div>
            <button
              onClick={() => tab === 'portfolio' ? loadPortfolio() : (activeWatchlistId != null ? loadWatchlistQuotes(activeWatchlistId) : loadWatchlists())}
              disabled={portfolioLoading || watchlistLoading}
              className="p-1.5 rounded-md text-metallic-400 hover:text-metallic-100 hover:bg-metallic-800 transition disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${(portfolioLoading || watchlistLoading) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3 bg-metallic-900">
          {tab === 'portfolio' ? (
            <PortfolioBody
              loading={portfolioLoading}
              error={portfolioError}
              portfolio={portfolio}
              rows={portfolioRows}
              dataUnavailable={dataUnavailable(portfolio?.data_source)}
              onClose={onClose}
            />
          ) : (
            <AnalysisWatchlistBody onClose={onClose} />
          )}
        </div>
      </aside>
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────────────────

function StateMessage({ icon: Icon, title, body }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-10 h-10 text-metallic-500 mb-3" />
      <div className="text-metallic-200 font-medium">{title}</div>
      {body && <div className="text-sm text-metallic-400 mt-2 max-w-md">{body}</div>}
    </div>
  );
}

function CompanyLink({ ticker, exchange, onClose, children }: {
  ticker: string;
  exchange: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ex = exchange ? `?exchange=${encodeURIComponent(exchange)}` : '';
  return (
    <Link
      href={`/company/${ticker.toUpperCase()}${ex}`}
      onClick={onClose}
      className="group flex items-center gap-1 text-metallic-100 hover:text-primary-300"
    >
      {children}
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
    </Link>
  );
}

function PortfolioBody({
  loading, error, portfolio, rows, dataUnavailable, onClose,
}: {
  loading: boolean;
  error: string | null;
  portfolio: PortfolioOverview | null;
  rows: PortfolioOverview['positions'];
  dataUnavailable: boolean;
  onClose: () => void;
}) {
  if (loading && !portfolio) {
    return <StateMessage icon={Loader2} title="Loading portfolio…" />;
  }
  if (error) {
    return <StateMessage icon={AlertCircle} title="Couldn't load portfolio" body={error} />;
  }
  if (dataUnavailable) {
    return (
      <StateMessage
        icon={AlertCircle}
        title="Portfolio feed unavailable"
        body="Your IB Gateway agent is offline. Start it locally to pull live positions — your saved tickers are still searchable."
      />
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <StateMessage
        icon={Briefcase}
        title="No open positions"
        body="Once your broker reports open trades they'll show up here. Click any holding to open its company analysis without leaving this page."
      />
    );
  }
  const agg = portfolio?.aggregate;
  return (
    <div>
      {agg && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Stat label="Market value" value={fmtMoney(agg.total_market_value)} />
          <Stat
            label={`Return (${portfolio?.timeframe})`}
            value={fmtPct(agg.weighted_period_return_pct)}
            tone={agg.weighted_period_return_pct ?? 0}
          />
          <Stat label="Period P&L" value={fmtMoney(agg.period_pnl)} tone={agg.period_pnl} />
          <Stat label="Unrealised" value={fmtMoney(agg.total_unrealised_pnl)} tone={agg.total_unrealised_pnl} />
        </div>
      )}
      <div className="rounded-lg border border-metallic-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-metallic-800/60 text-metallic-400 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Ticker</th>
              <th className="text-right px-3 py-2">Qty</th>
              <th className="text-right px-3 py-2">Price</th>
              <th className="text-right px-3 py-2">Value</th>
              <th className="text-right px-3 py-2">Return</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-metallic-800">
            {rows.map(p => (
              <tr key={p.id} className="hover:bg-metallic-800/40">
                <td className="px-3 py-2">
                  <CompanyLink ticker={p.ticker} exchange={p.exchange} onClose={onClose}>
                    <span className="font-medium">{p.ticker}</span>
                    <span className="text-xs text-metallic-500">.{p.exchange}</span>
                  </CompanyLink>
                </td>
                <td className="px-3 py-2 text-right text-metallic-300">{p.quantity}</td>
                <td className="px-3 py-2 text-right text-metallic-300">{fmtMoney(p.current_price)}</td>
                <td className="px-3 py-2 text-right text-metallic-200">{fmtMoney(p.market_value)}</td>
                <td className={`px-3 py-2 text-right ${pctColor(p.period_return_pct)}`}>
                  <div className="inline-flex items-center gap-1 justify-end">
                    {p.period_return_pct != null && p.period_return_pct >= 0 ? <TrendingUp className="w-3 h-3" /> : p.period_return_pct != null ? <TrendingDown className="w-3 h-3" /> : null}
                    {fmtPct(p.period_return_pct)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WatchlistBody({
  loading, error, watchlists, activeId, setActiveId, quotes, rows, dataUnavailable, onClose,
}: {
  loading: boolean;
  error: string | null;
  watchlists: Watchlist[];
  activeId: number | null;
  setActiveId: (id: number) => void;
  quotes: WatchlistQuotes | null;
  rows: WatchlistQuotes['items'];
  dataUnavailable: boolean;
  onClose: () => void;
}) {
  if (loading && !quotes && watchlists.length === 0) {
    return <StateMessage icon={Loader2} title="Loading watchlists…" />;
  }
  if (error) {
    return <StateMessage icon={AlertCircle} title="Couldn't load watchlists" body={error} />;
  }
  if (watchlists.length === 0) {
    return (
      <StateMessage
        icon={Bookmark}
        title="No watchlists yet"
        body="Add tickers from any company page to a watchlist — they'll appear here so you can jump back into their analysis fast."
      />
    );
  }
  return (
    <div>
      {/* Watchlist selector chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {watchlists.map(w => (
          <button
            key={w.id}
            onClick={() => setActiveId(w.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              activeId === w.id
                ? 'bg-primary-500/20 text-primary-200 border border-primary-500/40'
                : 'bg-metallic-800 text-metallic-300 border border-metallic-700 hover:bg-metallic-700'
            }`}
          >
            {w.name}
            <span className="ml-1.5 text-metallic-500">({w.item_count})</span>
            {w.is_default && <span className="ml-1.5 text-[10px] uppercase text-primary-300">default</span>}
          </button>
        ))}
      </div>

      {dataUnavailable && (
        <div className="mb-3 p-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
          Live quotes unavailable — IB Gateway agent is offline. Tickers are still clickable.
        </div>
      )}

      {quotes?.aggregate && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Stat
            label={`Avg return (${quotes.timeframe})`}
            value={fmtPct(quotes.aggregate.avg_return_pct)}
            tone={quotes.aggregate.avg_return_pct ?? 0}
          />
          <Stat
            label="Best"
            value={quotes.aggregate.best ? `${quotes.aggregate.best.ticker} ${fmtPct(quotes.aggregate.best.return_pct)}` : '—'}
            tone={1}
          />
          <Stat
            label="Worst"
            value={quotes.aggregate.worst ? `${quotes.aggregate.worst.ticker} ${fmtPct(quotes.aggregate.worst.return_pct)}` : '—'}
            tone={-1}
          />
        </div>
      )}

      {rows.length === 0 ? (
        <StateMessage
          icon={Bookmark}
          title="This watchlist is empty"
          body="Open any company page and click the bookmark icon to add it here."
        />
      ) : (
        <div className="rounded-lg border border-metallic-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-metallic-800/60 text-metallic-400 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Ticker</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-right px-3 py-2">Return</th>
                <th className="text-left px-3 py-2 hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-metallic-800">
              {rows.map(it => (
                <tr key={it.id} className="hover:bg-metallic-800/40">
                  <td className="px-3 py-2">
                    <CompanyLink ticker={it.ticker} exchange={it.exchange} onClose={onClose}>
                      <span className="font-medium">{it.ticker}</span>
                      <span className="text-xs text-metallic-500">.{it.exchange}</span>
                    </CompanyLink>
                  </td>
                  <td className="px-3 py-2 text-right text-metallic-300">{fmtMoney(it.current_price)}</td>
                  <td className={`px-3 py-2 text-right ${pctColor(it.period_return_pct)}`}>
                    {fmtPct(it.period_return_pct)}
                  </td>
                  <td className="px-3 py-2 text-metallic-400 hidden md:table-cell truncate max-w-[180px]">
                    {it.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: number | null }) {
  const colour = tone == null ? 'text-metallic-100'
    : tone > 0 ? 'text-emerald-400'
    : tone < 0 ? 'text-rose-400'
    : 'text-metallic-100';
  return (
    <div className="bg-metallic-800/50 border border-metallic-700/50 rounded-lg p-3">
      <div className="text-xs text-metallic-400">{label}</div>
      <div className={`text-base font-semibold mt-0.5 ${colour}`}>{value}</div>
    </div>
  );
}

/**
 * Watchlist tab body — reads from the same independent local watchlist
 * (`useAnalysisWatchlist`) that powers the WatchlistPanel on the analysis
 * dashboard, so the top-right drawer and the in-page panel stay in sync.
 */
function AnalysisWatchlistBody({ onClose }: { onClose: () => void }) {
  const { items, hydrated, add, remove } = useAnalysisWatchlist();

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs text-metallic-400 mb-1.5">
          <Search className="w-3.5 h-3.5" />
          <span>Search any ticker or company to add</span>
        </div>
        <TickerSearch
          placeholder="Add to watchlist — e.g. BHP, Pilbara, FMG…"
          onSelect={(company) => {
            add({
              ticker: company.symbol,
              exchange: company.exchange,
              name: company.name,
              commodity: company.primary_commodity,
            });
          }}
        />
        <p className="text-[11px] text-metallic-500 mt-1.5">
          Synced with the watchlist panel on the analysis dashboard and the
          bookmark button on every company profile.
        </p>
      </div>

      {!hydrated ? (
        <StateMessage icon={Loader2} title="Loading watchlist…" />
      ) : items.length === 0 ? (
        <StateMessage
          icon={Bookmark}
          title="Your watchlist is empty"
          body="Search above, or tap the bookmark icon on any company profile."
        />
      ) : (
        <div className="rounded-lg border border-metallic-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-metallic-800/60 text-metallic-400 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Ticker</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2 hidden md:table-cell">Commodity</th>
                <th className="text-right px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-metallic-800">
              {items.map((it) => (
                <tr
                  key={`${it.ticker}:${it.exchange || ''}`}
                  className="hover:bg-metallic-800/40"
                >
                  <td className="px-3 py-2">
                    <CompanyLink
                      ticker={it.ticker}
                      exchange={it.exchange || ''}
                      onClose={onClose}
                    >
                      <span className="font-medium">{it.ticker}</span>
                      {it.exchange && (
                        <span className="text-xs text-metallic-500">.{it.exchange}</span>
                      )}
                    </CompanyLink>
                  </td>
                  <td className="px-3 py-2 text-metallic-300 truncate max-w-[200px]">
                    {it.name || '—'}
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    {it.commodity ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary-500/10 text-primary-300">
                        {it.commodity}
                      </span>
                    ) : (
                      <span className="text-metallic-500">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => remove(it.ticker, it.exchange)}
                      className="p-1.5 rounded-md text-metallic-500 hover:text-rose-400 hover:bg-metallic-800 transition"
                      aria-label={`Remove ${it.ticker}`}
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
