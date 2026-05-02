import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, BarChart3, Globe, Zap, TrendingUp, Activity,
  Brain, Sparkles, Target, Map, Users, Newspaper,
  ChevronRight, Shield, Database, Check, Star, Lock,
  DollarSign, Layers, Search, FileText, AlertTriangle,
  PieChart, Award, Building2, Gem
} from 'lucide-react';
import TickerTape from '@/components/ui/TickerTape';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

/* ─── Stat Pill ─── */
function StatPill({ value, label, icon: Icon }: { value: string; label: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-metallic-800/60 rounded-full border border-metallic-700/50 backdrop-blur-sm">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary-400" />}
      <span className="text-sm font-bold text-primary-400">{value}</span>
      <span className="text-xs text-metallic-400">{label}</span>
    </div>
  );
}

/* ─── Feature Section with inline mockup ─── */
function FeatureShowcase({
  badge, title, description, features, ctaText, ctaHref,
  mockup, reverse = false,
}: {
  badge: string; title: string; description: string;
  features: { icon: React.ElementType; text: string }[];
  ctaText: string; ctaHref: string;
  mockup: React.ReactNode; reverse?: boolean;
}) {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
      <div className={reverse ? 'lg:order-2' : ''}>
        <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">{badge}</span>
        <h3 className="text-2xl sm:text-3xl font-bold text-metallic-100 mb-4 leading-tight">{title}</h3>
        <p className="text-metallic-400 text-sm leading-relaxed mb-6">{description}</p>
        <div className="space-y-3 mb-6">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-metallic-300">
              <div className="p-1.5 bg-primary-500/15 rounded text-primary-400 mt-0.5 flex-shrink-0"><f.icon className="w-4 h-4" /></div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
        <Link href={ctaHref} className="inline-flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors group">
          {ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        {mockup}
      </div>
    </div>
  );
}

/* ─── Screenshot Preview (replaces CSS mockups with real app screenshots) ─── */
function ScreenshotPreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="bg-metallic-900/80 border border-metallic-700/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-metallic-800 bg-metallic-900/50">
        <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400/60" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" /><span className="w-2.5 h-2.5 rounded-full bg-green-400/60" /></div>
        <span className="ml-2 text-[11px] text-metallic-500 font-mono">{alt}</span>
      </div>
      <Image src={src} alt={alt} width={800} height={600} className="w-full h-auto" quality={90} />
    </div>
  );
}

/* ─── Pricing Mini Card ─── */
function PricingMini({ name, price, period, features, popular = false, cta, ctaHref }: {
  name: string; price: string; period: string; features: string[];
  popular?: boolean; cta: string; ctaHref: string;
}) {
  return (
    <div className={`rounded-2xl border p-6 transition-all ${popular ? 'border-primary-500 bg-metallic-800/80 shadow-lg shadow-primary-500/20 scale-[1.02]' : 'border-metallic-700 bg-metallic-800/50 hover:border-metallic-600'}`}>
      {popular && <div className="text-center mb-3"><span className="rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-3 py-1 text-xs font-medium text-white">Most Popular</span></div>}
      <div className="text-center mb-5">
        <h3 className="text-lg font-semibold text-metallic-100">{name}</h3>
        <div className="mt-2"><span className="text-3xl font-bold text-metallic-50">{price}</span>{period && <span className="text-metallic-400 text-sm">{period}</span>}</div>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-metallic-300">
            <Check className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />{f}
          </li>
        ))}
      </ul>
      <Link href={ctaHref} className={`block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${popular ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25' : 'bg-metallic-700 text-metallic-100 hover:bg-metallic-600'}`}>
        {cta}
      </Link>
    </div>
  );
}

/* ─── Data Example Mockup Cards ─── */
function DataExampleCard({ icon: Icon, title, items, color }: {
  icon: React.ElementType; title: string; color: string;
  items: { label: string; value: string; valueColor?: string }[];
}) {
  return (
    <div className="bg-metallic-900/60 border border-metallic-800/60 rounded-xl p-4 hover:border-metallic-700/80 transition-colors">
      <div className={`flex items-center gap-2 mb-3 ${color}`}>
        <Icon className="w-4 h-4" />
        <h4 className="text-xs font-semibold uppercase tracking-wider">{title}</h4>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-metallic-400">{item.label}</span>
            <span className={`font-medium ${item.valueColor || 'text-white'}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HOMEPAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="bg-metallic-950 min-h-screen flex flex-col">
      <TickerTape />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-metallic-900 via-metallic-950 to-metallic-950" />
          <div className="absolute inset-0 opacity-[0.08] bg-[url('/topo-pattern.svg')] bg-repeat" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/30 border border-primary-700/50 text-primary-400 text-xs font-medium mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500" />
              </span>
              Now live: Automated Trading Platform · Interactive Brokers integration
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
              <span className="text-metallic-100">Research, Strategise &amp; </span>
              <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-accent-copper bg-clip-text text-transparent">
                Trade Mining
              </span>
              <br />
              <span className="text-metallic-100">From One Platform</span>
            </h1>

            <p className="text-lg sm:text-xl text-metallic-400 max-w-2xl leading-relaxed mb-8">
              AI that reads every mining announcement, scores sentiment, and routes trades through Interactive Brokers — across ASX, TSX, JSE, NYSE &amp; LSE. Two platforms, one login.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-6 max-w-2xl w-full">
              <Link href="/trading"
                className="group relative overflow-hidden px-6 py-4 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:shadow-[0_0_40px_rgba(20,184,166,0.5)] flex flex-col items-start gap-1 text-left">
                <span className="text-[10px] uppercase tracking-widest text-primary-200/80 font-bold">Trading Platform</span>
                <span className="text-base flex items-center gap-2">Open Workstation <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span>
                <span className="text-xs font-normal text-primary-100/80">Live IB orders · Strategies · Watchlists</span>
              </Link>
              <Link href="/dashboard"
                className="group relative overflow-hidden px-6 py-4 bg-metallic-800/80 hover:bg-metallic-700/80 border border-metallic-700 hover:border-metallic-600 text-metallic-100 font-semibold rounded-xl transition-all flex flex-col items-start gap-1 text-left">
                <span className="text-[10px] uppercase tracking-widest text-metallic-400 font-bold">Analysis Platform</span>
                <span className="text-base flex items-center gap-2">Open Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span>
                <span className="text-xs font-normal text-metallic-400">Signals · Maps · AI Analyst · Peers</span>
              </Link>
            </div>

            <div className="max-w-2xl w-full mb-6">
              <NewsletterSignup variant="hero" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/register"
                className="px-6 py-2.5 bg-transparent text-metallic-300 hover:text-metallic-100 font-medium text-sm transition-colors flex items-center justify-center gap-2">
                Start Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/pricing"
                className="px-6 py-2.5 bg-transparent text-metallic-300 hover:text-metallic-100 font-medium text-sm transition-colors flex items-center justify-center gap-2">
                View Pricing
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <StatPill icon={Database} value="2,000+" label="Companies" />
              <StatPill icon={FileText} value="6,000+" label="Announcements Parsed" />
              <StatPill icon={Activity} value="Live" label="Invest/Divest Signals" />
              <StatPill icon={Brain} value="AI" label="Powered Analysis" />
              <StatPill icon={Globe} value="50+" label="Countries" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ EXCHANGE BAR ═══ */}
      <section className="py-6 border-t border-b border-metallic-800/50 bg-metallic-900/20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6">
            {[
              { label: 'ASX', sub: 'Australia', count: '900+' },
              { label: 'TSX/TSXV', sub: 'Canada', count: '500+' },
              { label: 'JSE', sub: 'South Africa', count: '100+' },
              { label: 'NYSE/NASDAQ', sub: 'United States', count: '200+' },
              { label: 'LSE/AIM', sub: 'United Kingdom', count: '300+' },
            ].map(ex => (
              <div key={ex.label} className="flex items-center gap-2 px-4 py-2 bg-metallic-800/40 rounded-lg border border-metallic-700/30">
                <span className="font-bold text-metallic-200 text-sm">{ex.label}</span>
                <span className="text-metallic-600">·</span>
                <span className="text-xs text-metallic-500">{ex.sub}</span>
                <span className="text-[10px] text-primary-400 font-mono">{ex.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RESEARCH → STRATEGISE → EXECUTE ═══ */}
      <section className="py-16 border-b border-metallic-800/50 bg-gradient-to-b from-metallic-950 to-metallic-900/20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">End-to-end workflow</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-metallic-100 mb-3">Research. Strategise. Execute.</h2>
            <p className="text-metallic-400 max-w-2xl mx-auto text-sm">
              From reading drill results to firing live orders into Interactive Brokers — the whole loop, automated and auditable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                num: '1', title: 'Research', icon: Search,
                color: 'border-emerald-500/30 bg-emerald-500/[0.04]',
                chip: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                desc: 'AI-parsed announcements, drill results, resource estimates, peer benchmarks, sentiment.',
                cta: 'Explore data', href: '/dashboard',
              },
              {
                num: '2', title: 'Strategise', icon: Brain,
                color: 'border-primary-500/30 bg-primary-500/[0.04]',
                chip: 'text-primary-400 bg-primary-500/10 border-primary-500/30',
                desc: 'Design rule-based strategies with Claude Opus 4.7 or the visual builder. Backtest in seconds.',
                cta: 'AI Strategy Architect', href: '/trading/strategies',
              },
              {
                num: '3', title: 'Execute', icon: Zap,
                color: 'border-amber-500/30 bg-amber-500/[0.04]',
                chip: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                desc: 'Paper trade live, or connect Interactive Brokers via OAuth for real execution — with an emergency kill switch.',
                cta: 'Connect Interactive Brokers', href: '/onboarding/broker',
              },
            ].map((band) => {
              const Icon = band.icon;
              return (
                <div key={band.num} className={`relative rounded-xl border ${band.color} p-6 flex flex-col`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold ${band.chip}`}>{band.num}</span>
                    <Icon className="w-5 h-5 text-metallic-300" />
                    <h3 className="text-lg font-semibold text-metallic-100">{band.title}</h3>
                  </div>
                  <p className="text-sm text-metallic-400 leading-relaxed mb-5 flex-1">{band.desc}</p>
                  <Link href={band.href} className="inline-flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors group">
                    {band.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ WHAT MAKES US DIFFERENT ═══ */}
      <section className="py-20 border-b border-metallic-800/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">Why InvestOre</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-metallic-100 mb-4">
              Everything a Mining Investor Needs.<br />One Platform.
            </h2>
            <p className="text-metallic-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Stop juggling spreadsheets, PDF readers, and multiple websites. InvestOre consolidates drill results, 
              resource estimates, commodity prices, news sentiment, and AI analysis in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Brain, title: 'AI That Reads Announcements', desc: 'Every ASX, TSX, JSE announcement is parsed by AI to extract drill results, resource estimates, and key metrics automatically.', color: 'text-emerald-400', accent: 'bg-emerald-500/10 border-emerald-500/20' },
              { icon: TrendingUp, title: 'Live Invest/Divest Signals', desc: 'Real-time buy/sell signals generated from news flow, sentiment analysis, and fundamental changes — updated daily.', color: 'text-violet-400', accent: 'bg-violet-500/10 border-violet-500/20' },
              { icon: BarChart3, title: 'Peer Valuation Benchmarks', desc: 'Compare EV/Resource, P/NAV, and in-situ valuations across custom peer groups. Find which stocks are mispriced.', color: 'text-cyan-400', accent: 'bg-cyan-500/10 border-cyan-500/20' },
              { icon: Globe, title: 'Global Coverage, 5 Exchanges', desc: '2,000+ mining companies across ASX, TSX, JSE, NYSE and LSE. Filter by commodity, country, stage, and more.', color: 'text-amber-400', accent: 'bg-amber-500/10 border-amber-500/20' },
            ].map((item) => (
              <div key={item.title} className={`${item.accent} border rounded-xl p-5 hover:scale-[1.02] transition-transform`}>
                <div className={`p-2.5 w-fit rounded-lg ${item.accent} ${item.color} mb-4`}><item.icon className="w-6 h-6" /></div>
                <h3 className="font-semibold text-metallic-100 mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-metallic-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 1: AI ANALYST ═══ */}
      <section className="py-20 border-b border-metallic-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FeatureShowcase
            badge="AI-Powered"
            title="Ask Anything About Mining Companies & Commodities"
            description="Our AI analyst has ingested every announcement, drill result, and resource estimate in the database. Ask questions in plain English and get investment-grade answers backed by real data."
            features={[
              { icon: Brain, text: '"Which gold explorers in WA have drill results above 5 g/t?" — instant answer from 6,000+ announcements' },
              { icon: Target, text: 'Get STRONG BUY / BUY / HOLD ratings with price targets, entry zones, and risk/reward ratios' },
              { icon: Sparkles, text: 'Commodity intelligence: ask "Best copper stocks for long-term growth?" and get tiered recommendations' },
              { icon: Activity, text: 'Sentiment-driven insights: the AI explains what the news means for each stock' },
            ]}
            ctaText="Try the AI Analyst"
            ctaHref="/analysis/ai-analyst"
            mockup={<ScreenshotPreview src="/screenshots/ai-analyst.png" alt="AI Research Analyst" />}
          />
        </div>
      </section>

      {/* ═══ FEATURE 2: SENTIMENT SIGNALS ═══ */}
      <section className="py-20 border-b border-metallic-800/50 bg-metallic-900/20 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FeatureShowcase
            badge="Real-Time Signals"
            title="Know When to Invest, Divest, or Watch"
            description="Every mining company is continuously scored for sentiment using news flow, announcements, and AI analysis. Get actionable invest/divest/watch signals that update daily."
            features={[
              { icon: TrendingUp, text: 'INVEST signals when positive catalysts align — production beats, high-grade discoveries, capital raisings' },
              { icon: AlertTriangle, text: 'DIVEST alerts for operational setbacks, leadership changes, or deteriorating fundamentals' },
              { icon: Search, text: 'Filter signals by commodity, exchange, strength, and date — build a watchlist that matters' },
              { icon: Newspaper, text: 'Every signal links to the source news so you can verify and do deeper due diligence' },
            ]}
            ctaText="Explore Signals"
            ctaHref="/analysis/sentiment"
            mockup={<ScreenshotPreview src="/screenshots/cross-exchange.png" alt="Cross-Exchange Intelligence" />}
            reverse
          />
        </div>
      </section>

      {/* ═══ FEATURE 3: PEER ANALYTICS ═══ */}
      <section className="py-20 border-b border-metallic-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FeatureShowcase
            badge="Valuation Analytics"
            title="Find Mispriced Mining Stocks in Seconds"
            description="Build custom peer groups and instantly compare EV/Resource, P/NAV, and in-situ valuations. See which companies trade at a discount to peers and why."
            features={[
              { icon: BarChart3, text: 'Side-by-side comparison of EV/Resource, P/NAV, Market Cap, and price performance' },
              { icon: Layers, text: 'Custom peer groups by commodity, country, stage (explorer → producer), and exchange' },
              { icon: PieChart, text: 'Orebody valuations with in-situ metal value, implied discounts, and price-to-ISV ratios' },
              { icon: DollarSign, text: 'Live commodity prices integrated — see how gold/copper/lithium moves affect valuations' },
            ]}
            ctaText="Compare Companies"
            ctaHref="/analysis/compare"
            mockup={<ScreenshotPreview src="/screenshots/commodity-breakdown.png" alt="Commodity Breakdown" />}
          />
        </div>
      </section>

      {/* ═══ FEATURE 4: COMMODITY PRICES ═══ */}
      <section className="py-20 border-b border-metallic-800/50 bg-metallic-900/20 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FeatureShowcase
            badge="Global Intelligence"
            title="Every Mining Project on One Interactive Map"
            description="Explore 2,000+ mining projects across 50+ countries. Filter by commodity, stage, and size. Overlay geological data, infrastructure, and jurisdiction risk to spot opportunities."
            features={[
              { icon: Map, text: '50+ countries with project pins — zoom in from global view to individual tenements' },
              { icon: Globe, text: 'Country-level analytics: production data, geological survey reports, geoscience insights' },
              { icon: Database, text: 'Filter by commodity (Gold, Copper, Lithium, Uranium...), project stage, and market cap' },
              { icon: Layers, text: 'Overlay geological maps, infrastructure layers, and prospectivity scoring' },
            ]}
            ctaText="Explore the Map"
            ctaHref="/map"
            mockup={<ScreenshotPreview src="/screenshots/commodity-prices.png" alt="Commodity Spot Prices" />}
            reverse
          />
        </div>
      </section>

      {/* ═══ FEATURE 5: NEWS & SENTIMENT ═══ */}
      <section className="py-20 border-b border-metallic-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FeatureShowcase
            badge="News Intelligence"
            title="AI-Scored Mining News From Every Exchange"
            description="3,500+ news articles aggregated from ASX, TSX, JSE, NYSE and LSE — each scored for sentiment by AI. Spot material events, trading halts, and production updates instantly."
            features={[
              { icon: Newspaper, text: 'Real-time news feed from 5 exchanges with category tags: Corporate, Exploration, Production, Trading Halt' },
              { icon: Activity, text: 'AI sentiment scoring on every article — positive, negative, or neutral — with confidence levels' },
              { icon: AlertTriangle, text: 'Material event detection: drilling results, resource upgrades, capital raisings, management changes' },
              { icon: Search, text: 'Filter by exchange, ticker, date range — find any company\'s news history in seconds' },
            ]}
            ctaText="Browse News"
            ctaHref="/news"
            mockup={<ScreenshotPreview src="/screenshots/news-hits.png" alt="News Hits" />}
          />
        </div>
      </section>

      {/* ═══ REAL DATA EXAMPLES ═══ */}
      <section className="py-20 border-b border-metallic-800/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">Real Data</span>
            <h2 className="text-3xl font-bold text-metallic-100 mb-3">See What&apos;s Inside the Platform</h2>
            <p className="text-metallic-400 max-w-lg mx-auto text-sm">
              Here are examples of the data and analysis you get access to — updated daily from 5 exchanges.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DataExampleCard icon={Gem} title="Drill Intercepts" color="text-amber-400" items={[
              { label: 'DEG.ASX', value: '9.2m @ 12.4 g/t Au' },
              { label: 'SLR.ASX', value: '15m @ 8.7 g/t Au' },
              { label: 'SFR.ASX', value: '22m @ 3.1% Cu' },
              { label: 'PLS.ASX', value: '18m @ 1.4% Li₂O' },
            ]} />
            <DataExampleCard icon={PieChart} title="Orebody Valuations" color="text-purple-400" items={[
              { label: 'In-Situ Value', value: '$4.2B' },
              { label: 'Enterprise Value', value: '$1.8B' },
              { label: 'Price/ISV', value: '0.43x', valueColor: 'text-emerald-400' },
              { label: 'Implied Discount', value: '57%', valueColor: 'text-emerald-400' },
            ]} />
            <DataExampleCard icon={Activity} title="Sentiment Score" color="text-blue-400" items={[
              { label: 'Signal', value: 'INVEST', valueColor: 'text-emerald-400' },
              { label: 'Sentiment 7d', value: '+0.72', valueColor: 'text-emerald-400' },
              { label: 'News Hits (7d)', value: '14 articles' },
              { label: 'Material Events', value: '3', valueColor: 'text-amber-400' },
            ]} />
            <DataExampleCard icon={DollarSign} title="Commodity Prices" color="text-cyan-400" items={[
              { label: 'Gold', value: '$2,650/oz', valueColor: 'text-amber-400' },
              { label: 'Copper', value: '$4.15/lb' },
              { label: 'Lithium', value: '$12,800/t' },
              { label: 'Uranium', value: '$63.50/lb', valueColor: 'text-emerald-400' },
            ]} />
          </div>
        </div>
      </section>

      {/* ═══ MORE FEATURES GRID ═══ */}
      <section className="py-20 border-b border-metallic-800/50 bg-metallic-900/20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">Full Feature Set</span>
            <h2 className="text-3xl font-bold text-metallic-100 mb-3">Built for Serious Mining Investors</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FileText, title: 'Announcement Database', desc: '6,000+ ASX/TSX/JSE announcements parsed with AI — drill results, resource upgrades, and production reports extracted automatically.' },
              { icon: Database, title: 'Resource Estimates', desc: 'JORC-compliant resource data with Measured, Indicated & Inferred categories. Compare tonnage, grade, and contained metal.' },
              { icon: Building2, title: 'Company Deep Dives', desc: 'Detailed profiles with financials, projects, resource tables, capital raisings, and key personnel.' },
              { icon: Newspaper, title: 'Multi-Exchange News', desc: 'Real-time news aggregation from ASX, TSX, JSE, NYSE, and LSE — filtered, categorised, and sentiment-scored.' },
              { icon: DollarSign, title: 'Commodity Intelligence', desc: 'Ask the AI about any commodity sector — gold, copper, lithium, uranium — and get sector outlooks with company recommendations.' },
              { icon: Shield, title: 'Geoscience Reports', desc: 'Country-level geological data from USGS, Geoscience Australia, and mining ministry publications.' },
            ].map(f => (
              <div key={f.title} className="bg-metallic-900/50 border border-metallic-800/50 rounded-xl p-5 hover:border-metallic-700/60 transition-colors">
                <div className="p-2 bg-primary-500/10 rounded-lg w-fit text-primary-400 mb-3"><f.icon className="w-5 h-5" /></div>
                <h3 className="font-semibold text-metallic-100 mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-metallic-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING SECTION ═══ */}
      <section id="pricing" className="py-20 border-b border-metallic-800/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-metallic-100 mb-3">Simple, Transparent Pricing</h2>
            <p className="text-metallic-400 max-w-lg mx-auto text-sm">
              Start free. Upgrade when you need exports, API access, and premium features.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingMini
              name="Free"
              price="$0"
              period="/month"
              features={[
                'Browse 2,000+ companies',
                'Basic peer comparison',
                'Global map access',
                'AI Analyst (limited)',
                'Sentiment signals (view only)',
                'Community support',
              ]}
              cta="Get Started Free"
              ctaHref="/register"
            />
            <PricingMini
              name="Professional"
              price="$49"
              period="/month"
              popular
              features={[
                'Everything in Free',
                'Unlimited AI Analyst queries',
                '50 saved peer sets',
                'CSV & JSON export',
                'Full API access (10k req/day)',
                'Price alerts & custom formulas',
                'Full map layers & export',
                'Priority support',
              ]}
              cta="Start 7-Day Free Trial"
              ctaHref="/pricing"
            />
            <PricingMini
              name="Enterprise"
              price="Custom"
              period=""
              features={[
                'Everything in Professional',
                'Unlimited everything',
                'White-label option',
                'Custom data feeds',
                'SSO integration',
                'Dedicated account manager',
              ]}
              cta="Contact Sales"
              ctaHref="/contact"
            />
          </div>

          <p className="text-center text-xs text-metallic-500 mt-6">
            Annual billing available at $490/year (save $98). All plans include daily data updates.
          </p>
        </div>
      </section>

      {/* ═══ WHO IT'S FOR ═══ */}
      <section className="py-20 border-b border-metallic-800/50 bg-metallic-900/20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">Who It&apos;s For</span>
            <h2 className="text-3xl font-bold text-metallic-100 mb-3">Built for Every Mining Investor</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, title: 'Retail Investors', desc: 'Find mining opportunities before the crowd. Our AI does the research so you don\'t spend hours reading PDFs.' },
              { icon: Award, title: 'Fund Managers', desc: 'Screen 2,000+ companies instantly. Build custom peer sets and export data for portfolio management.' },
              { icon: Search, title: 'Analysts & Researchers', desc: 'Access standardised resource data, drill intercepts, and sentiment scores across all commodities.' },
              { icon: Building2, title: 'Mining Companies', desc: 'Benchmark against peers, track competitor announcements, and monitor sector sentiment.' },
            ].map(p => (
              <div key={p.title} className="bg-metallic-800/30 border border-metallic-700/30 rounded-xl p-5 text-center">
                <div className="p-3 bg-primary-500/10 rounded-full w-fit mx-auto text-primary-400 mb-4"><p.icon className="w-6 h-6" /></div>
                <h3 className="font-semibold text-metallic-100 mb-2 text-sm">{p.title}</h3>
                <p className="text-xs text-metallic-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-metallic-900/50 to-metallic-950" />
        <div className="absolute inset-0 bg-[url('/topo-pattern.svg')] bg-repeat opacity-[0.04]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/5 rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-metallic-100 mb-4">
            Ready to Find Your Next Mining Investment?
          </h2>
          <p className="text-metallic-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Join analysts, fund managers, and investors who use InvestOre to discover undervalued mining companies and make data-driven decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/register"
              className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-900/30 flex items-center justify-center gap-2 text-sm">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing"
              className="px-8 py-3.5 text-metallic-300 font-medium rounded-lg border border-metallic-700 hover:border-metallic-500 hover:text-metallic-100 transition-all text-sm text-center">
              Compare Plans
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-metallic-500">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Secure payments via Stripe</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3" />No credit card required</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3" />Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  );
}
