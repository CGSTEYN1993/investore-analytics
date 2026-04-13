/**
 * Cross-Exchange Signals Service
 *
 * Fetches cross-exchange trend signals, pre-open reports,
 * exchange status, and alert subscription management.
 */

import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API = RAILWAY_API_URL;

// ── Types ──

export interface ExchangeStatus {
  code: string;
  name: string;
  timezone: string;
  local_time: string;
  is_open: boolean;
  status: 'OPEN' | 'CLOSED';
  minutes_until_open: number | null;
  next_open: string | null;
  currency: string;
}

export interface CrossExchangeSignal {
  id: number;
  source_exchange: string;
  target_exchange: string;
  commodity_group: string;
  signal_type: 'bullish' | 'bearish' | 'neutral';
  signal_strength: 'strong' | 'moderate' | 'weak';
  headline: string;
  reasoning: string | null;
  source_avg_change_pct: number;
  source_companies_up: number;
  source_companies_down: number;
  source_top_movers: Array<{ symbol: string; change_pct: number }>;
  predicted_direction: 'up' | 'down' | 'flat';
  predicted_magnitude_pct: number;
  confidence: number;
  affected_tickers: Array<{ symbol: string; name: string; commodity: string }>;
  correlation_factor: number;
  source_close_time: string | null;
  target_open_time: string | null;
  is_sent: boolean;
  created_at: string | null;
}

export interface PreOpenReport {
  exchange: string;
  exchange_name: string;
  local_time: string | null;
  next_open: string | null;
  minutes_until_open: number | null;
  outlook: string;
  outlook_emoji: string;
  total_signals: number;
  bullish_signals: number;
  bearish_signals: number;
  signals: CrossExchangeSignal[];
}

// ── API Calls ──

export async function fetchExchangeStatus(): Promise<{
  exchanges: ExchangeStatus[];
  total: number;
  open_count: number;
  closed_count: number;
}> {
  const res = await fetch(`${API}/api/v1/signals/exchanges/status`);
  if (!res.ok) throw new Error('Failed to fetch exchange status');
  return res.json();
}

export async function fetchCrossExchangeSignals(params?: {
  target_exchange?: string;
  source_exchange?: string;
  signal_type?: string;
  commodity_group?: string;
  min_confidence?: number;
  limit?: number;
}): Promise<{
  signals: CrossExchangeSignal[];
  total: number;
  bullish_count: number;
  bearish_count: number;
}> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }
  const qs = searchParams.toString();
  const res = await fetch(`${API}/api/v1/signals/cross-exchange${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch cross-exchange signals');
  return res.json();
}

export async function fetchPreOpenReport(
  exchange: string,
  hours?: number
): Promise<PreOpenReport> {
  const qs = hours ? `?hours=${hours}` : '';
  const res = await fetch(
    `${API}/api/v1/signals/pre-open/${exchange.toUpperCase()}${qs}`
  );
  if (!res.ok) throw new Error('Failed to fetch pre-open report');
  return res.json();
}

export async function triggerCrossExchangeAnalysis(
  sourceExchanges?: string,
  targetExchanges?: string
): Promise<Record<string, unknown>> {
  const searchParams = new URLSearchParams();
  if (sourceExchanges) searchParams.append('source_exchanges', sourceExchanges);
  if (targetExchanges) searchParams.append('target_exchanges', targetExchanges);
  const qs = searchParams.toString();
  const res = await fetch(
    `${API}/api/v1/signals/cross-exchange/analyze${qs ? `?${qs}` : ''}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Failed to trigger analysis');
  return res.json();
}

export async function subscribeToAlerts(params: {
  email: string;
  user_id?: number;
  display_name?: string;
  exchanges?: string;
  commodities?: string;
  min_strength?: string;
}): Promise<Record<string, unknown>> {
  const searchParams = new URLSearchParams();
  searchParams.append('email', params.email);
  if (params.user_id) searchParams.append('user_id', String(params.user_id));
  if (params.display_name) searchParams.append('display_name', params.display_name);
  if (params.exchanges) searchParams.append('exchanges', params.exchanges);
  if (params.commodities) searchParams.append('commodities', params.commodities);
  if (params.min_strength) searchParams.append('min_strength', params.min_strength);
  const res = await fetch(
    `${API}/api/v1/signals/alerts/subscribe?${searchParams.toString()}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Failed to subscribe');
  return res.json();
}

export async function runMigration(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}/api/v1/signals/run-migration`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run migration');
  return res.json();
}
