'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchAccounts,
  fetchOnboardingStatus,
  startIBOAuth,
  acceptLegals,
  type TradingAccount,
  type OnboardingStatusResponse,
} from '@/services/tradingService';
import {
  CheckCircle2,
  Circle,
  ShieldAlert,
  ExternalLink,
  Loader2,
  ArrowRight,
  Bot,
} from 'lucide-react';

type Step = 'choose' | 'legals' | 'link' | 'done';

const LEGAL_DOCS = [
  { id: 'risk_disclosure', label: 'Mining & Equity Trading Risk Disclosure', version: 'v1' },
  { id: 'ib_customer', label: 'Interactive Brokers Customer Agreement', version: 'v2024' },
  { id: 'algo_consent', label: 'Algorithmic Trading Consent', version: 'v1' },
  { id: 'data_consent', label: 'Data Processing & Storage Consent', version: 'v1' },
];

export default function BrokerOnboardingPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<OnboardingStatusResponse | null>(null);
  const [step, setStep] = useState<Step>('choose');
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const accs = await fetchAccounts();
        setAccounts(accs);
        if (accs.length > 0) setSelectedId(accs[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      try {
        const s = await fetchOnboardingStatus(selectedId);
        setStatus(s);
        if (s.is_live_ready) setStep('done');
        else if (s.legals_accepted && !s.broker_linked) setStep('link');
        else setStep('choose');
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [selectedId]);

  const allAccepted = LEGAL_DOCS.every((d) => accepted[d.id]);

  const handleAcceptLegals = async () => {
    if (!selectedId || !allAccepted) return;
    setLinking(true);
    try {
      const docs: Record<string, string> = {};
      LEGAL_DOCS.forEach((d) => { docs[d.id] = d.version; });
      await acceptLegals(selectedId, docs);
      const s = await fetchOnboardingStatus(selectedId);
      setStatus(s);
      setStep('link');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLinking(false);
    }
  };

  const handleStartOAuth = async () => {
    if (!selectedId) return;
    setLinking(true);
    try {
      const r = await startIBOAuth(selectedId);
      if (!r.configured) {
        setError('IB Client Portal OAuth is not yet configured on the server. An administrator needs to set IBCP_CLIENT_ID / IBCP_CLIENT_SECRET.');
        setLinking(false);
        return;
      }
      // Store selected account ID so callback page can pick it up
      sessionStorage.setItem('onboarding_account_id', String(selectedId));
      window.location.href = r.authorize_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-metallic-950 text-metallic-100">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metallic-950 text-metallic-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="w-6 h-6 text-primary-400" />
          <h1 className="text-2xl font-bold">Connect your broker</h1>
        </div>
        <p className="text-metallic-400 mb-8">
          Link Interactive Brokers so InvestOre can execute strategies on your behalf.
          You can stop execution at any time from the kill switch in the header.
        </p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <StepDot active={step === 'choose'} done={status?.legals_accepted ?? false} label="1. Account" />
          <ArrowRight className="w-4 h-4 text-metallic-600" />
          <StepDot active={step === 'legals'} done={status?.legals_accepted ?? false} label="2. Legals" />
          <ArrowRight className="w-4 h-4 text-metallic-600" />
          <StepDot active={step === 'link'} done={status?.broker_linked ?? false} label="3. Link broker" />
          <ArrowRight className="w-4 h-4 text-metallic-600" />
          <StepDot active={step === 'done'} done={status?.is_live_ready ?? false} label="4. Go live" />
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 text-sm flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Account selector */}
        {accounts.length === 0 ? (
          <div className="rounded-xl border border-metallic-800 bg-metallic-900/60 p-6">
            <p className="text-metallic-300 mb-4">
              You need a trading account first. Create one (paper mode is fine) and come back here.
            </p>
            <Link href="/trading/accounts" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium">
              Create account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <label className="block text-sm font-medium text-metallic-300 mb-2">Select account to connect</label>
            <select
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full mb-8 bg-metallic-900 border border-metallic-700 rounded-lg px-3 py-2 text-metallic-100 focus:outline-none focus:border-primary-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} · {a.account_name} · {a.is_paper ? 'PAPER' : 'LIVE'} · {a.broker}
                </option>
              ))}
            </select>

            {/* Step 1 / Legals */}
            {!status?.legals_accepted && (
              <section className="rounded-xl border border-metallic-800 bg-metallic-900/60 p-6 mb-6">
                <h2 className="text-lg font-semibold mb-1">Accept legal disclosures</h2>
                <p className="text-sm text-metallic-400 mb-5">
                  Automated trading in mining equities carries substantial risk. Please confirm you have read and accept the following.
                </p>
                <div className="space-y-3 mb-5">
                  {LEGAL_DOCS.map((d) => (
                    <label key={d.id} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!accepted[d.id]}
                        onChange={(e) => setAccepted({ ...accepted, [d.id]: e.target.checked })}
                        className="mt-1 w-4 h-4 accent-primary-500"
                      />
                      <span className="text-sm text-metallic-200">
                        I have read and accept the <span className="text-primary-400">{d.label}</span>
                        <span className="text-metallic-500 ml-2 text-xs">({d.version})</span>
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleAcceptLegals}
                  disabled={!allAccepted || linking}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:bg-metallic-800 disabled:text-metallic-500 text-white font-medium"
                >
                  {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Accept &amp; continue
                </button>
              </section>
            )}

            {/* Step 2 / Link broker */}
            {status?.legals_accepted && !status.broker_linked && (
              <section className="rounded-xl border border-metallic-800 bg-metallic-900/60 p-6 mb-6">
                <h2 className="text-lg font-semibold mb-1">Link Interactive Brokers</h2>
                <p className="text-sm text-metallic-400 mb-5">
                  You&apos;ll be redirected to IB to authorise InvestOre. We never see your password — only a short-lived OAuth token that you can revoke anytime from your IB account.
                </p>
                <button
                  onClick={handleStartOAuth}
                  disabled={linking}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium"
                >
                  {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  Link with Interactive Brokers
                </button>
              </section>
            )}

            {/* Step 3 / Ready */}
            {status?.is_live_ready && (
              <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                  <CheckCircle2 className="w-5 h-5" /> Ready for live trading
                </div>
                <p className="text-sm text-metallic-300 mb-4">
                  Your broker is linked, legals accepted and MFA active. You can now enable live strategies.
                </p>
                <Link href="/trading/strategies" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium">
                  Go to strategies <ArrowRight className="w-4 h-4" />
                </Link>
              </section>
            )}

            {/* Readiness checklist */}
            {status && !status.is_live_ready && (
              <section className="rounded-xl border border-metallic-800 bg-metallic-900/40 p-5">
                <div className="text-sm font-medium text-metallic-300 mb-3">Readiness checklist</div>
                <ReadinessItem ok={status.legals_accepted} label="Legal disclosures accepted" />
                <ReadinessItem ok={status.broker_linked} label="Broker linked" />
                <ReadinessItem ok={status.mfa_enabled} label="Multi-factor auth enabled (optional for paper)" />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  const color = done
    ? 'text-emerald-400 border-emerald-500/50'
    : active
      ? 'text-primary-400 border-primary-500/50'
      : 'text-metallic-500 border-metallic-700';
  return (
    <div className={`px-3 py-1.5 rounded-full border ${color} text-xs font-medium`}>
      {label}
    </div>
  );
}

function ReadinessItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1 text-sm">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : (
        <Circle className="w-4 h-4 text-metallic-600" />
      )}
      <span className={ok ? 'text-metallic-200' : 'text-metallic-400'}>{label}</span>
    </div>
  );
}
