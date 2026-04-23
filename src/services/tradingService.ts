/**
 * Trading Platform Service
 *
 * API client for the InvestOre automated trading platform.
 * All endpoints require enterprise tier access.
 */

import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API = RAILWAY_API_URL;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function authFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Types ──

export interface TradingAccount {
  id: number;
  user_id: number;
  account_name: string;
  broker: string;
  is_paper: boolean;
  initial_balance: number;
  current_balance: number;
  base_currency: string;
  is_active: boolean;
  is_connected: boolean;
  max_position_pct: number;
  max_total_exposure_pct: number;
  max_daily_loss_pct: number;
  max_positions: number;
  created_at: string;
}

export interface RuleConfig {
  type: string;
  params: Record<string, unknown>;
}

export interface TradingStrategy {
  id: number;
  account_id: number;
  name: string;
  description: string | null;
  entry_rules: RuleConfig[];
  exit_rules: RuleConfig[];
  entry_logic: 'AND' | 'OR';
  min_entry_match: number;
  position_sizing: string;
  max_position_pct: number;
  max_positions: number;
  exchanges: string[];
  commodities: string[];
  schedule_interval: number;
  is_active: boolean;
  created_at: string;
}

export interface TradingSignal {
  id: number;
  strategy_id: number;
  ticker: string;
  exchange: string;
  signal_type: 'entry' | 'exit';
  strength: number;
  triggered_rules: Record<string, unknown>[];
  status: string;
  created_at: string;
}

export interface TradingOrder {
  id: number;
  account_id: number;
  signal_id: number | null;
  ticker: string;
  exchange: string;
  side: 'buy' | 'sell';
  order_type: string;
  quantity: number;
  price: number | null;
  filled_price: number | null;
  commission: number;
  status: string;
  is_paper: boolean;
  created_at: string;
  filled_at: string | null;
}

export interface TradingPosition {
  id: number;
  account_id: number;
  ticker: string;
  exchange: string;
  side: 'long' | 'short';
  quantity: number;
  entry_price: number;
  current_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  trailing_stop_pct: number | null;
  unrealised_pnl: number | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
}

export interface PerformanceSnapshot {
  id: number;
  account_id: number;
  date: string;
  portfolio_value: number;
  daily_pnl: number;
  total_pnl: number;
  win_rate: number | null;
  total_trades: number;
  drawdown_pct: number | null;
}

export interface TradeHistory {
  id: number;
  account_id: number;
  ticker: string;
  exchange: string;
  side: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  pnl_pct: number;
  hold_duration_hours: number | null;
  strategy_name: string | null;
  exit_reason: string | null;
  opened_at: string;
  closed_at: string;
}

export interface TradingAlert {
  id: number;
  user_id: number;
  alert_type: string;
  condition: Record<string, unknown>;
  is_active: boolean;
  last_triggered: string | null;
  created_at: string;
}

export interface TradingDashboard {
  accounts: TradingAccount[];
  active_strategies: number;
  open_positions: TradingPosition[];
  todays_signals: number;
  todays_orders: number;
  total_portfolio_value: number;
  total_pnl: number;
  recent_trades: TradeHistory[];
  performance: PerformanceSnapshot[];
  alerts: TradingAlert[];
}

export interface EngineStatus {
  is_running: boolean;
  last_cycle_at: string | null;
  strategies_active: number;
  signals_today: number;
  orders_today: number;
  errors_today: number;
  uptime_hours: number;
}

export interface RuleTemplate {
  type: string;
  category: string;
  label: string;
  description: string;
  params: Record<string, { type: string; default: unknown; description?: string; min?: number; max?: number; options?: string[] }>;
}

export interface RuleTemplatesResponse {
  entry_rules: RuleTemplate[];
  exit_rules: RuleTemplate[];
}

// ── API Functions ──

// Accounts
export async function fetchAccounts(): Promise<TradingAccount[]> {
  return authFetch<TradingAccount[]>(`${API}/api/v1/trading/accounts`);
}

export async function createAccount(data: {
  account_name: string;
  broker?: string;
  is_paper?: boolean;
  initial_balance?: number;
  base_currency?: string;
  broker_host?: string;
  broker_port?: number;
  broker_client_id?: number;
  broker_account_id?: string;
  broker_agent_id?: string;
}): Promise<TradingAccount> {
  return authFetch<TradingAccount>(`${API}/api/v1/trading/accounts`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(accountId: number): Promise<void> {
  await authFetch<{ status: string }>(`${API}/api/v1/trading/accounts/${accountId}`, {
    method: 'DELETE',
  });
}

// Live broker account summary (NetLiq / BuyingPower / cash / etc.)
export interface AccountSummary {
  account_id: number;
  broker: string;
  currency: string;
  is_live: boolean;
  fields: Record<string, number | string | null>;
}

export async function fetchAccountSummary(accountId: number): Promise<AccountSummary> {
  return authFetch<AccountSummary>(`${API}/api/v1/trading/accounts/${accountId}/summary`);
}

// Broker reachability probe (cheap TCP check / agent-registry lookup)
export interface BrokerStatus {
  account_id: number;
  broker: string;
  mode: 'paper' | 'live';
  reachable: boolean;
  host: string | null;
  port: number | null;
  agent_id?: string;
  message: string;
}

export async function fetchBrokerStatus(accountId: number): Promise<BrokerStatus> {
  return authFetch<BrokerStatus>(`${API}/api/v1/trading/accounts/${accountId}/broker-status`);
}

// Universe — tickers covered by InvestOre research
export interface UniverseItem {
  symbol: string;
  name: string;
  exchange: string;
  primary_commodity: string;
  country: string;
  market_cap_category: string;
}

export async function fetchUniverse(opts: {
  exchange?: string;
  q?: string;
  limit?: number;
} = {}): Promise<{ items: UniverseItem[]; total: number }> {
  const params = new URLSearchParams();
  if (opts.exchange) params.set('exchange', opts.exchange);
  if (opts.q) params.set('q', opts.q);
  if (opts.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  return authFetch<{ items: UniverseItem[]; total: number }>(
    `${API}/api/v1/trading/universe${qs ? '?' + qs : ''}`,
  );
}

// Charting — OHLCV from Yahoo Finance (free, ~20 min delayed)
export interface OHLCVCandle {
  timestamp: number;  // ms epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OHLCVChartResponse {
  symbol: string;
  exchange: string;
  yahoo_symbol: string;
  range: string;
  interval: string;
  currency: string | null;
  instrument_type: string | null;
  exchange_timezone: string | null;
  regular_market_price: number | null;
  previous_close: number | null;
  candles: OHLCVCandle[];
}

export async function fetchChart(
  symbol: string,
  opts: { exchange?: string; range?: string; interval?: string } = {},
): Promise<OHLCVChartResponse> {
  const params = new URLSearchParams();
  if (opts.exchange) params.set('exchange', opts.exchange);
  if (opts.range) params.set('range', opts.range);
  if (opts.interval) params.set('interval', opts.interval);
  const qs = params.toString();
  return authFetch<OHLCVChartResponse>(
    `${API}/api/v1/trading/chart/${encodeURIComponent(symbol)}${qs ? '?' + qs : ''}`,
  );
}

// Strategies
export async function fetchStrategies(accountId?: number): Promise<TradingStrategy[]> {
  const params = accountId ? `?account_id=${accountId}` : '';
  return authFetch<TradingStrategy[]>(`${API}/api/v1/trading/strategies${params}`);
}

export async function createStrategy(data: {
  account_id: number;
  name: string;
  description?: string;
  entry_rules: RuleConfig[];
  exit_rules: RuleConfig[];
  entry_logic?: 'AND' | 'OR';
  min_entry_match?: number;
  position_sizing?: string;
  max_position_pct?: number;
  max_positions?: number;
  exchanges?: string[];
  commodities?: string[];
  schedule_interval?: number;
}): Promise<TradingStrategy> {
  return authFetch<TradingStrategy>(`${API}/api/v1/trading/strategies`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function toggleStrategy(strategyId: number, isActive: boolean): Promise<{ status: string }> {
  return authFetch<{ status: string }>(`${API}/api/v1/trading/strategies/${strategyId}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function runStrategy(strategyId: number): Promise<{ status: string; signals_generated: number }> {
  return authFetch<{ status: string; signals_generated: number }>(
    `${API}/api/v1/trading/strategies/${strategyId}/run`,
    { method: 'POST' },
  );
}

export async function deleteStrategy(strategyId: number): Promise<void> {
  await authFetch<{ status: string }>(`${API}/api/v1/trading/strategies/${strategyId}`, {
    method: 'DELETE',
  });
}

// ─── Backtest ──────────────────────────────────────────────────────────────

export interface BacktestTrade {
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  net_pnl: number;
  return_pct: number;
  exit_reason: string;
}

export interface BacktestResult {
  symbol: string;
  exchange: string;
  start_date: string;
  end_date: string;
  initial_balance: number;
  final_value: number;
  total_return_pct: number;
  max_drawdown_pct: number;
  sharpe_ratio: number | null;
  num_trades: number;
  win_rate: number | null;
  equity_curve: Array<{ date: string; equity: number }>;
  trades: BacktestTrade[];
}

export async function backtestStrategy(
  strategyId: number,
  body: { symbol: string; exchange?: string; period_days?: number; initial_balance?: number },
): Promise<BacktestResult> {
  return authFetch<BacktestResult>(
    `${API}/api/v1/trading/strategies/${strategyId}/backtest`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export async function backtestRules(body: {
  symbol: string;
  exchange: string;
  entry_rules: RuleConfig[];
  exit_rules: RuleConfig[];
  entry_logic?: 'AND' | 'OR';
  initial_balance?: number;
  position_pct?: number;
  period_days?: number;
}): Promise<BacktestResult> {
  return authFetch<BacktestResult>(`${API}/api/v1/trading/backtest`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ─── AI Strategy Architect ──────────────────────────────────────────────────

export interface AIDesignRequest {
  account_id: number;
  prompt: string;
  preferred_exchanges?: string[];
  preferred_commodities?: string[];
  risk_profile?: 'conservative' | 'balanced' | 'aggressive';
}

export interface AIDesignResponse {
  strategy: {
    account_id: number;
    name: string;
    description?: string | null;
    strategy_type: string;
    exchanges: string[];
    commodities?: string[] | null;
    min_market_cap?: number | null;
    max_market_cap?: number | null;
    min_avg_volume?: number | null;
    entry_rules: RuleConfig[];
    entry_logic: 'AND' | 'OR';
    min_rules_match: number;
    exit_rules: RuleConfig[];
    position_sizing: string;
    position_size_pct: number;
    max_positions: number;
    order_type: string;
    limit_offset_pct: number;
    check_interval_minutes: number;
    trading_hours_only: boolean;
  };
  rationale: string;
  model: string;
  rule_catalog_version: string;
}

export async function designStrategyWithAI(
  body: AIDesignRequest,
): Promise<AIDesignResponse> {
  return authFetch<AIDesignResponse>(
    `${API}/api/v1/ai-analyst/strategy-architect/design`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

// Signals
export async function fetchSignals(params?: {
  strategy_id?: number;
  status?: string;
  limit?: number;
}): Promise<TradingSignal[]> {
  const q = new URLSearchParams();
  if (params?.strategy_id) q.append('strategy_id', String(params.strategy_id));
  if (params?.status) q.append('status', params.status);
  if (params?.limit) q.append('limit', String(params.limit));
  const qs = q.toString();
  return authFetch<TradingSignal[]>(`${API}/api/v1/trading/signals${qs ? `?${qs}` : ''}`);
}

// Orders
export async function fetchOrders(accountId?: number, limit = 50): Promise<TradingOrder[]> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (accountId) q.append('account_id', String(accountId));
  return authFetch<TradingOrder[]>(`${API}/api/v1/trading/orders?${q}`);
}

export async function submitManualOrder(data: {
  account_id: number;
  symbol: string;
  exchange: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type?: string;
  limit_price?: number;
  stop_price?: number;
}): Promise<TradingOrder> {
  return authFetch<TradingOrder>(`${API}/api/v1/trading/orders/manual`, {
    method: 'POST',
    body: JSON.stringify({ order_type: 'market', ...data }),
  });
}

// Positions
export async function fetchPositions(params?: {
  account_id?: number;
  status?: 'open' | 'closed' | 'all';
}): Promise<TradingPosition[]> {
  const q = new URLSearchParams();
  if (params?.account_id) q.append('account_id', String(params.account_id));
  if (params?.status) q.append('status', params.status);
  const qs = q.toString();
  return authFetch<TradingPosition[]>(`${API}/api/v1/trading/positions${qs ? `?${qs}` : ''}`);
}

export async function closePosition(positionId: number): Promise<{ status: string }> {
  return authFetch<{ status: string }>(`${API}/api/v1/trading/positions/${positionId}/close`, {
    method: 'POST',
  });
}

// Performance & History
export async function fetchPerformance(accountId?: number, days = 30): Promise<PerformanceSnapshot[]> {
  const q = new URLSearchParams({ days: String(days) });
  if (accountId) q.append('account_id', String(accountId));
  return authFetch<PerformanceSnapshot[]>(`${API}/api/v1/trading/performance?${q}`);
}

export async function fetchTradeHistory(params?: {
  account_id?: number;
  ticker?: string;
  limit?: number;
}): Promise<TradeHistory[]> {
  const q = new URLSearchParams();
  if (params?.account_id) q.append('account_id', String(params.account_id));
  if (params?.ticker) q.append('ticker', params.ticker);
  if (params?.limit) q.append('limit', String(params.limit));
  const qs = q.toString();
  return authFetch<TradeHistory[]>(`${API}/api/v1/trading/history${qs ? `?${qs}` : ''}`);
}

// Dashboard
export async function fetchDashboard(): Promise<TradingDashboard> {
  return authFetch<TradingDashboard>(`${API}/api/v1/trading/dashboard`);
}

// Engine Status
export async function fetchEngineStatus(): Promise<EngineStatus> {
  return authFetch<EngineStatus>(`${API}/api/v1/trading/engine-status`);
}

// ── Kill Switch ──
export async function killSwitch(): Promise<{
  paused_strategies: number;
  cancelled_orders: number;
  errors: string[];
}> {
  return authFetch(`${API}/api/v1/trading/engine/kill`, { method: 'POST' });
}

// ── Broker Onboarding ──
export interface OnboardingStatusResponse {
  account_id: number;
  broker: string;
  is_paper: boolean;
  broker_linked: boolean;
  legals_accepted: boolean;
  mfa_enabled: boolean;
  is_live_ready: boolean;
}

export async function fetchOnboardingStatus(accountId: number): Promise<OnboardingStatusResponse> {
  return authFetch(`${API}/api/v1/trading/onboarding/status/${accountId}`);
}

export async function startIBOAuth(accountId: number): Promise<{
  authorize_url: string;
  state: string;
  configured: boolean;
}> {
  return authFetch(`${API}/api/v1/trading/onboarding/ib/oauth/start`, {
    method: 'POST',
    body: JSON.stringify({ account_id: accountId }),
  });
}

export async function acceptLegals(
  accountId: number,
  documents: Record<string, string>,
): Promise<{ accepted: string[] }> {
  return authFetch(`${API}/api/v1/trading/onboarding/accept-legals`, {
    method: 'POST',
    body: JSON.stringify({ account_id: accountId, documents }),
  });
}

// ── Audit log ──
export interface AuditEvent {
  id: number;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export async function fetchAuditLog(limit = 100): Promise<{ events: AuditEvent[] }> {
  return authFetch(`${API}/api/v1/trading/audit-log?limit=${limit}`);
}

// ── SSE live tape (returns EventSource-compatible URL) ──
export function liveTapeUrl(kinds: string[] = ['signals', 'orders', 'audit']): string {
  const token = getToken();
  const qs = new URLSearchParams({ kinds: kinds.join(',') });
  if (token) qs.set('access_token', token); // fallback if auth header not supported on EventSource
  return `${API}/api/v1/trading/live-tape?${qs.toString()}`;
}

// Alerts
export async function fetchAlerts(): Promise<TradingAlert[]> {
  return authFetch<TradingAlert[]>(`${API}/api/v1/trading/alerts`);
}

export async function createAlert(data: {
  alert_type: string;
  condition: Record<string, unknown>;
}): Promise<TradingAlert> {
  return authFetch<TradingAlert>(`${API}/api/v1/trading/alerts`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAlert(alertId: number): Promise<void> {
  await authFetch<{ status: string }>(`${API}/api/v1/trading/alerts/${alertId}`, {
    method: 'DELETE',
  });
}

// Rule Templates
export async function fetchRuleTemplates(): Promise<RuleTemplatesResponse> {
  return authFetch<RuleTemplatesResponse>(`${API}/api/v1/trading/rule-templates`);
}

// ── Position Detail ──

export interface ChartCandle {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number;
}

export interface PositionDetailOrder {
  id: number;
  side: string;
  type: string;
  quantity: number;
  fill_price: number | null;
  status: string;
  created_at: string;
}

export interface PositionSignal {
  id: number;
  type: string;
  strength: number | null;
  triggered_rules: Record<string, unknown>[] | null;
  created_at: string;
}

export interface PositionDetail {
  id: number;
  ticker: string;
  exchange: string;
  side: 'long' | 'short';
  status: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  trailing_stop_pct: number | null;
  strategy_name: string | null;
  account_name: string | null;
  currency: string;
  opened_at: string | null;
  closed_at: string | null;
  chart: ChartCandle[];
  data_source: string;
  unrealised_pnl: number;
  pnl_pct: number;
  position_value: number;
  cost_basis: number;
  day_change: number;
  day_change_pct: number;
  sl_distance_pct: number | null;
  tp_distance_pct: number | null;
  risk_reward_ratio: number | null;
  hold_hours: number | null;
  orders: PositionDetailOrder[];
  signal: PositionSignal | null;
  sentiment: {
    count_7d: number;
    avg: number | null;
    max: number | null;
    min: number | null;
  };
}

export async function fetchPositionDetail(positionId: number): Promise<PositionDetail> {
  return authFetch<PositionDetail>(`${API}/api/v1/trading/position-detail/${positionId}`);
}

// ── Portfolio (live broker positions with timeframe returns) ──

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL';
export const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD', 'ALL'];

export interface PortfolioPosition {
  id: number;
  account_id: number;
  ticker: string;
  exchange: string;
  side: string;
  quantity: number;
  entry_price: number;
  current_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  market_value: number;
  since_entry_pnl: number | null;
  period_start_price: number | null;
  period_return_pct: number | null;
  period_pnl: number | null;
  opened_at: string;
}

export interface PortfolioOverview {
  account_id: number | null;
  timeframe: Timeframe;
  positions: PortfolioPosition[];
  aggregate: {
    total_market_value: number;
    total_unrealised_pnl: number;
    weighted_period_return_pct: number | null;
    period_pnl: number;
    best: { ticker: string; return_pct: number } | null;
    worst: { ticker: string; return_pct: number } | null;
  };
  data_source: 'ib_agent' | 'unavailable';
}

export async function fetchPortfolioOverview(
  timeframe: Timeframe = '1M',
  accountId?: number,
): Promise<PortfolioOverview> {
  const q = new URLSearchParams({ timeframe });
  if (accountId) q.append('account_id', String(accountId));
  return authFetch<PortfolioOverview>(`${API}/api/v1/portfolio/overview?${q}`);
}

// ── Watchlist ──

export interface Watchlist {
  id: number;
  name: string;
  is_default: boolean;
  created_at: string;
  item_count: number;
}

export interface WatchlistItem {
  id: number;
  watchlist_id: number;
  ticker: string;
  exchange: string;
  notes: string | null;
  added_at: string;
  current_price?: number | null;
  period_start_price?: number | null;
  period_return_pct?: number | null;
  bar_count?: number;
}

export interface WatchlistQuotes {
  watchlist_id: number;
  timeframe: Timeframe;
  items: WatchlistItem[];
  aggregate: {
    avg_return_pct: number | null;
    best: { ticker: string; return_pct: number } | null;
    worst: { ticker: string; return_pct: number } | null;
  };
  data_source: 'ib_agent' | 'unavailable';
}

export async function fetchWatchlists(): Promise<Watchlist[]> {
  return authFetch<Watchlist[]>(`${API}/api/v1/watchlist`);
}

export async function createWatchlist(name: string): Promise<Watchlist> {
  return authFetch<Watchlist>(`${API}/api/v1/watchlist`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function deleteWatchlist(id: number): Promise<{ ok: boolean }> {
  return authFetch(`${API}/api/v1/watchlist/${id}`, { method: 'DELETE' });
}

export async function addWatchlistItem(
  watchlistId: number,
  ticker: string,
  exchange: string,
  notes?: string,
): Promise<WatchlistItem> {
  return authFetch<WatchlistItem>(`${API}/api/v1/watchlist/${watchlistId}/items`, {
    method: 'POST',
    body: JSON.stringify({ ticker, exchange, notes }),
  });
}

export async function removeWatchlistItem(
  watchlistId: number,
  itemId: number,
): Promise<{ ok: boolean }> {
  return authFetch(`${API}/api/v1/watchlist/${watchlistId}/items/${itemId}`, {
    method: 'DELETE',
  });
}

export async function fetchWatchlistQuotes(
  watchlistId: number,
  timeframe: Timeframe = '1M',
): Promise<WatchlistQuotes> {
  return authFetch<WatchlistQuotes>(
    `${API}/api/v1/watchlist/${watchlistId}/quotes?timeframe=${timeframe}`,
  );
}

// ── IB Gateway control ─────────────────────────────────────────────────────

export interface GatewayStatus {
  configured: boolean;
  process_running: boolean;
  port_open: boolean;
  ib_host: string;
  ib_port: number;
  trading_mode: 'paper' | 'live';
  auto_launch: boolean;
  ibc_path: string;
  gateway_path: string;
  has_username: boolean;
  has_password: boolean;
}

export interface GatewayConfig {
  ibc_path: string;
  gateway_path: string;
  trading_mode: 'paper' | 'live';
  username: string;
  ib_host: string;
  ib_port: number;
  auto_launch: boolean;
  has_password: boolean;
}

export interface GatewayConfigUpdate {
  ibc_path?: string;
  gateway_path?: string;
  trading_mode?: 'paper' | 'live';
  username?: string;
  password?: string;
  ib_host?: string;
  ib_port?: number;
  auto_launch?: boolean;
}

export interface GatewayStartResult {
  ok: boolean;
  already_running?: boolean;
  message?: string;
  error?: string;
}

export async function fetchGatewayStatus(): Promise<GatewayStatus> {
  return authFetch<GatewayStatus>(`${API}/api/v1/agent/gateway/status`);
}

export async function fetchGatewayConfig(): Promise<GatewayConfig> {
  return authFetch<GatewayConfig>(`${API}/api/v1/agent/gateway/config`);
}

export async function updateGatewayConfig(
  body: GatewayConfigUpdate,
): Promise<{ ok: boolean; config: GatewayConfig }> {
  return authFetch(`${API}/api/v1/agent/gateway/config`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function startGateway(): Promise<GatewayStartResult> {
  return authFetch<GatewayStartResult>(`${API}/api/v1/agent/gateway/start`, {
    method: 'POST',
  });
}

export async function clearGatewayCredentials(): Promise<{ ok: boolean }> {
  return authFetch(`${API}/api/v1/agent/gateway/credentials`, {
    method: 'DELETE',
  });
}
