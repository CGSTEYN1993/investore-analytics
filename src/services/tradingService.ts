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
  name: string;
  broker: string;
  mode: 'paper' | 'live';
  initial_balance: number;
  current_balance: number;
  currency: string;
  is_active: boolean;
  connection_status: string;
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
  name: string;
  description: string;
  params: Record<string, { type: string; default: unknown; description: string }>;
}

// ── API Functions ──

// Accounts
export async function fetchAccounts(): Promise<TradingAccount[]> {
  return authFetch<TradingAccount[]>(`${API}/api/v1/trading/accounts`);
}

export async function createAccount(data: {
  name: string;
  broker?: string;
  mode?: 'paper' | 'live';
  initial_balance?: number;
  currency?: string;
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
  ticker: string;
  exchange: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type?: string;
  price?: number;
}): Promise<TradingOrder> {
  return authFetch<TradingOrder>(`${API}/api/v1/trading/orders/manual`, {
    method: 'POST',
    body: JSON.stringify(data),
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
export async function fetchRuleTemplates(): Promise<RuleTemplate[]> {
  return authFetch<RuleTemplate[]>(`${API}/api/v1/trading/rule-templates`);
}
