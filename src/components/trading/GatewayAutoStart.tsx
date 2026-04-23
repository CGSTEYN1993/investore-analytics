'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { fetchGatewayStatus, startGateway } from '@/services/tradingService';

const SESSION_KEY = 'gateway_autostart_attempted';

/**
 * Mounted globally. When the user becomes authenticated, attempts to start
 * the local IB Gateway exactly once per browser session — provided the local
 * trading agent is online, credentials are configured, and gateway isn't
 * already running. Silent on failure (the trading layout's GatewayLauncher
 * banner surfaces any issues when the user navigates to /trading).
 */
export default function GatewayAutoStart() {
  const { isAuthenticated, isLoading } = useAuth();
  const triggered = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (triggered.current) return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;

    triggered.current = true;
    sessionStorage.setItem(SESSION_KEY, '1');

    (async () => {
      try {
        const status = await fetchGatewayStatus();
        if (!status.configured) return;
        if (status.port_open) return;
        await startGateway();
      } catch {
        // Agent offline / not connected / not configured — silent.
      }
    })();
  }, [isAuthenticated, isLoading]);

  return null;
}
