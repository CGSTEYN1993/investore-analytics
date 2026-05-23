import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, BarChart3, Globe, Zap, TrendingUp,
  Brain, Users, Newspaper,
  Shield, Database, Check,
  DollarSign, Search, FileText,
  Award, Building2,
} from 'lucide-react';
import TickerTape from '@/components/ui/TickerTape';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import SpinningLogo3D from '@/components/ui/SpinningLogo3D';

/* ─── Quiet photo backdrop ─── */
function PhotoBackdrop({
  src,
  opacity = 0.18,
  brightness = 0.65,
  overlay = 'bg-gradient-to-b from-metallic-900/90 via-metallic-900/80 to-metallic-900',
}: {
  src: string;
  opacity?: number;
  brightness?: number;
  overlay?: string;
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover hidden sm:block"
        style={{
          opacity,
          filter: `grayscale(0.7) sepia(0.15) saturate(0.85) contrast(1.02) brightness(${brightness})`,
        }}
      />
      <div className={`absolute inset-0 ${overlay}`} />
    </>
  );
}

/* ─── Restrained section header ─── */
function SectionHeader({
  eyebrow, title, lede,
  accent = 'copper',
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  accent?: 'copper' | 'gold' | 'silver';
}) {
  const accentClass = {
    copper: 'text-accent-copper',
    gold: 'text-accent-gold',
    silver: 'text-metallic-300',
  }[accent];
  return (
    <div className="mb-12 max-w-2xl">
      <div className={`text-[11px] tracking-[0.22em] uppercase ${accentClass} mb-3`}>{eyebrow}</div>
      <h2 className="font-display text-2xl sm:text-3xl font-medium text-metallic-50 leading-tight">{title}</h2>
      {lede && <p className="mt-3 text-sm text-metallic-400 leading-relaxed">{lede}</p>}
    </div>
  );
}

/* ─── Quiet bordered card ─── */
function PlainCard({
  children, className = '',
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-metallic-800/60 border border-metallic-700/60 rounded-lg p-5 hover:border-metallic-600 transition-colors ${className}`}>
      {children}
    </div>
  );
}

/* ─── Minimalist CTA button ─── */
function CTA({
  href, children, variant = 'default',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'default' | 'copper' | 'gold' | 'silver' | 'ghost';
}) {
  const styles = {
    default: 'border border-metallic-600 text-metallic-50 hover:border-metallic-400 bg-metallic-800/60',
    copper: 'border border-accent-copper/60 text-accent-copper hover:bg-accent-copper/10 hover:border-accent-copper',
    gold: 'border border-accent-gold/60 text-accent-gold hover:bg-accent-gold/10 hover:border-accent-gold',
    silver: 'border border-metallic-300/50 text-metallic-100 hover:bg-metallic-700/40 hover:border-metallic-200',
    ghost: 'text-metallic-200 hover:text-white',
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded text-sm font-medium tracking-wide transition-all ${styles}`}
    >
      {children}
    </Link>
  );
}

/* ─── Screenshot card with quiet chrome ─── */
function ScreenshotPreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="bg-metallic-800/70 border border-metallic-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-metallic-700 bg-metallic-800/80">
        <span className="w-2 h-2 rounded-full bg-metallic-500" />
        <span className="w-2 h-2 rounded-full bg-metallic-500" />
        <span className="w-2 h-2 rounded-full bg-metallic-500" />
        <span className="ml-2 text-[10px] text-metallic-400 font-mono tracking-wider">{alt}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="block w-full h-auto" loading="lazy" />
    </div>
  );
}

/* ─── Two-column feature row ─── */
function FeatureRow({
  eyebrow, title, body, points, ctaHref, ctaLabel, mockup, reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  ctaHref: string;
  ctaLabel: string;
  mockup: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="text-[11px] tracking-[0.22em] uppercase text-accent-copper mb-3">{eyebrow}</div>
        <h3 className="font-display text-2xl sm:text-3xl font-medium text-metallic-50 mb-4 leading-tight">{title}</h3>
        <p className="text-metallic-400 text-sm leading-relaxed mb-5">{body}</p>
        <ul className="space-y-2 mb-6">
          {points.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-metallic-300">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-accent-copper flex-shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <Link href={ctaHref} className="inline-flex items-center gap-1.5 text-sm text-metallic-200 hover:text-metallic-50 border-b border-metallic-700 hover:border-accent-copper pb-0.5 transition-colors">
          {ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>{mockup}</div>
    </div>
  );
}

/* ─── Minimal pricing card ─── */
function PriceCard({
  name, price, period, items, highlighted = false, cta, ctaHref,
}: {
  name: string; price: string; period: string; items: string[];
  highlighted?: boolean; cta: string; ctaHref: string;
}) {
  return (
    <div className={`rounded-lg p-6 flex flex-col ${
      highlighted
        ? 'border border-accent-gold/60 bg-metallic-800/70'
        : 'border border-metallic-700/70 bg-metallic-800/50'
    }`}>
      <div className="mb-5">
        <div className="text-[11px] tracking-[0.22em] uppercase text-metallic-400 mb-2">{name}</div>
        <div>
          <span className="font-display text-3xl font-medium text-metallic-50 tabular">{price}</span>
          {period && <span className="text-metallic-500 text-sm ml-1">{period}</span>}
        </div>
      </div>
      <ul className="space-y-2 mb-6 flex-1">
        {items.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-metallic-300">
            <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${highlighted ? 'text-accent-gold' : 'text-metallic-500'}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <CTA href={ctaHref} variant={highlighted ? 'gold' : 'silver'}>{cta}</CTA>
    </div>
  );
}

/* ─── Compact data sample card ─── */
function DataSample({
  title, items,
}: {
  title: string;
  items: { label: string; value: string }[];
}) {
  return (
    <div className="border border-metallic-700/70 rounded-lg p-4 bg-metallic-800/50">
      <div className="text-[11px] tracking-[0.22em] uppercase text-metallic-400 mb-3">{title}</div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-metallic-400">{item.label}</span>
            <span className="text-metallic-50 font-mono">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HOMEPAGE — minimalist, structured
   ═══════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="bg-metallic-900 text-metallic-100 min-h-screen flex flex-col">
      <TickerTape />

      {/* ═══ HERO ═══ */}
      <section className="relative border-b border-metallic-700/60">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mining/headframe.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-25 hidden sm:block"
            style={{ filter: 'grayscale(0.85) contrast(1.02) brightness(0.55)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-metallic-900/85 via-metallic-900/75 to-metallic-900" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">

            {/* Left: text */}
            <div className="lg:col-span-5">
              <div className="text-[11px] tracking-[0.24em] uppercase text-accent-copper mb-4">
                Mining Research &amp; Trading
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-metallic-50 mb-5">
                Research, strategise and trade mining from one platform.
              </h1>
              <p className="text-base text-metallic-400 leading-relaxed mb-8 max-w-lg">
                AI reads every mining announcement, scores sentiment and routes trades through Interactive Brokers — across ASX, TSX, JSE, NYSE and LSE.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <CTA href="/trading" variant="copper">Open Workstation</CTA>
                <CTA href="/dashboard" variant="silver">Open Dashboard</CTA>
                <CTA href="/register" variant="ghost">Start free <ArrowRight className="w-3.5 h-3.5" /></CTA>
              </div>

              <div className="max-w-md mb-8">
                <NewsletterSignup variant="hero" />
              </div>

              <dl className="grid grid-cols-3 gap-6 max-w-md border-t border-metallic-700/60 pt-5">
                <div>
                  <dt className="text-[10px] tracking-[0.22em] uppercase text-metallic-500">Companies</dt>
                  <dd className="font-display text-xl text-metallic-100 tabular">2,000+</dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.22em] uppercase text-metallic-500">Announcements</dt>
                  <dd className="font-display text-xl text-metallic-100 tabular">6,000+</dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.22em] uppercase text-metallic-500">Exchanges</dt>
                  <dd className="font-display text-xl text-metallic-100 tabular">5</dd>
                </div>
              </dl>
            </div>

            {/* Right: spinning 3D logo */}
            <div className="lg:col-span-7">
              <div className="relative border border-metallic-700 rounded-lg bg-metallic-800/60 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-metallic-700 bg-metallic-800/80">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] tracking-[0.22em] uppercase text-metallic-400">Brand</span>
                    <span className="text-xs font-mono text-metallic-200">INVESTORE · 3D</span>
                  </div>
                  <span className="text-[10px] tracking-[0.22em] uppercase text-accent-copper">Live</span>
                </div>
                <SpinningLogo3D />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ EXCHANGES ═══ */}
      <section className="border-b border-metallic-700/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-[11px] tracking-[0.22em] uppercase text-metallic-500">Coverage</div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-metallic-400">
              {[
                { label: 'ASX', sub: 'Australia', count: '900+' },
                { label: 'TSX/TSXV', sub: 'Canada', count: '500+' },
                { label: 'JSE', sub: 'South Africa', count: '100+' },
                { label: 'NYSE/NASDAQ', sub: 'United States', count: '200+' },
                { label: 'LSE/AIM', sub: 'United Kingdom', count: '300+' },
              ].map(ex => (
                <div key={ex.label} className="flex items-baseline gap-2">
                  <span className="text-metallic-100 font-medium">{ex.label}</span>
                  <span className="text-metallic-600">·</span>
                  <span className="text-metallic-500">{ex.sub}</span>
                  <span className="font-mono text-accent-copper/80">{ex.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RESEARCH → STRATEGISE → EXECUTE ═══ */}
      <section className="relative border-b border-metallic-700/60">
        <PhotoBackdrop src="/mining/stacker.jpg" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <SectionHeader
            eyebrow="Workflow"
            title="Research. Strategise. Execute."
            lede="From reading drill results to firing live orders into Interactive Brokers — the whole loop, automated and auditable."
          />

          <div className="grid md:grid-cols-3 gap-px bg-metallic-800/60 border border-metallic-700/60 rounded-lg overflow-hidden">
            {[
              {
                num: '01', accent: 'text-accent-copper', title: 'Research', icon: Search,
                desc: 'AI-parsed announcements, drill results, resource estimates, peer benchmarks, sentiment.',
                cta: 'Explore data', href: '/dashboard',
              },
              {
                num: '02', accent: 'text-metallic-200', title: 'Strategise', icon: Brain,
                desc: 'Design rule-based strategies with Claude or the visual builder. Backtest in seconds.',
                cta: 'Strategy architect', href: '/trading/strategies',
              },
              {
                num: '03', accent: 'text-accent-gold', title: 'Execute', icon: Zap,
                desc: 'Paper-trade live or connect Interactive Brokers via OAuth — with an emergency kill switch.',
                cta: 'Connect broker', href: '/onboarding/broker',
              },
            ].map((band) => {
              const Icon = band.icon;
              return (
                <div key={band.num} className="bg-metallic-900 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-mono text-xs tracking-widest ${band.accent}`}>{band.num}</span>
                    <Icon className="w-4 h-4 text-metallic-500" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-metallic-50 mb-2">{band.title}</h3>
                  <p className="text-sm text-metallic-400 leading-relaxed mb-5">{band.desc}</p>
                  <Link href={band.href} className="inline-flex items-center gap-1.5 text-xs text-metallic-300 hover:text-metallic-50 border-b border-metallic-700 hover:border-accent-copper pb-0.5">
                    {band.cta} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ WHY ═══ */}
      <section className="relative border-b border-metallic-700/60">
        <PhotoBackdrop src="/mining/loader-truck.jpg" opacity={0.16} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <SectionHeader
            eyebrow="Why InvestOre"
            title="Everything a mining investor needs. One platform."
            lede="Stop juggling spreadsheets, PDF readers and websites. Drill results, resource estimates, commodity prices, news sentiment and AI analysis in one place."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Brain, title: 'AI reads announcements', desc: 'Every ASX, TSX, JSE filing parsed by AI to extract drill results, resource estimates and key metrics.' },
              { icon: TrendingUp, title: 'Invest / divest signals', desc: 'Daily buy/sell signals from news flow, sentiment and fundamental changes.' },
              { icon: BarChart3, title: 'Peer valuation', desc: 'Compare EV/Resource, P/NAV and in-situ valuations across custom peer groups.' },
              { icon: Globe, title: 'Five exchanges', desc: '2,000+ mining companies across ASX, TSX, JSE, NYSE and LSE — filterable by commodity and stage.' },
            ].map(item => (
              <PlainCard key={item.title}>
                <item.icon className="w-4 h-4 text-accent-copper mb-3" />
                <h3 className="font-medium text-metallic-100 mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-metallic-400 leading-relaxed">{item.desc}</p>
              </PlainCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURE ROWS ═══ */}
      <section className="relative border-b border-metallic-700/60">
        <PhotoBackdrop src="/mining/tunnel.jpg" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <FeatureRow
            eyebrow="AI Analyst"
            title="Ask anything about mining companies and commodities."
            body="The analyst has ingested every announcement, drill result and resource estimate. Ask plain English questions and get investment-grade answers backed by real data."
            points={[
              'Which WA gold explorers have drill results above 5 g/t — answered from 6,000+ announcements.',
              'STRONG BUY / BUY / HOLD ratings with price targets, entry zones and risk/reward.',
              'Commodity intelligence — "best copper stocks for long-term growth" returns tiered picks.',
              'Sentiment-driven insights that explain what the news means for each ticker.',
            ]}
            ctaLabel="Try the AI Analyst"
            ctaHref="/analysis/ai-analyst"
            mockup={<ScreenshotPreview src="/screenshots/ai-analyst.png?v=6" alt="AI Research Analyst" />}
          />
        </div>
      </section>

      <section className="relative border-b border-metallic-700/60 bg-metallic-800/30">
        <PhotoBackdrop src="/mining/plant-sunset.jpg" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <FeatureRow
            reverse
            eyebrow="Sentiment signals"
            title="Know when to invest, divest or watch."
            body="Every company is continuously scored from news flow, announcements and AI analysis. Actionable signals that update daily."
            points={[
              'INVEST when catalysts align — production beats, high-grade hits, raisings.',
              'DIVEST on operational setbacks, leadership changes or deteriorating fundamentals.',
              'Filter by commodity, exchange, strength and date.',
              'Every signal links to its source news for verification.',
            ]}
            ctaLabel="Explore signals"
            ctaHref="/analysis/sentiment"
            mockup={<ScreenshotPreview src="/screenshots/cross-exchange.png?v=6" alt="Cross-Exchange Intelligence" />}
          />
        </div>
      </section>

      <section className="relative border-b border-metallic-700/60">
        <PhotoBackdrop src="/mining/bucket-wheel.jpg" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <FeatureRow
            eyebrow="Peer analytics"
            title="Find mispriced mining stocks in seconds."
            body="Build custom peer groups and instantly compare EV/Resource, P/NAV and in-situ valuations. See which companies trade at a discount and why."
            points={[
              'Side-by-side EV/Resource, P/NAV, market cap and price performance.',
              'Custom peer groups by commodity, country, stage and exchange.',
              'Orebody valuations with in-situ metal value and implied discount.',
              'Live commodity prices integrated.',
            ]}
            ctaLabel="Compare companies"
            ctaHref="/analysis/compare"
            mockup={<ScreenshotPreview src="/screenshots/commodity-breakdown.png?v=6" alt="Commodity Breakdown" />}
          />
        </div>
      </section>

      <section className="relative border-b border-metallic-700/60 bg-metallic-800/30">
        <PhotoBackdrop src="/mining/spreaders.jpg" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <FeatureRow
            reverse
            eyebrow="Global map"
            title="Every mining project on one interactive map."
            body="Explore 2,000+ projects across 50+ countries. Filter by commodity, stage and size. Overlay geological data, infrastructure and jurisdiction risk."
            points={[
              '50+ countries with project pins — global to tenement view.',
              'Country analytics: production data, geological surveys, geoscience.',
              'Filter by commodity, project stage and market cap.',
              'Overlay geological maps, infrastructure and prospectivity scoring.',
            ]}
            ctaLabel="Explore the map"
            ctaHref="/analysis/map"
            mockup={<ScreenshotPreview src="/screenshots/commodity-prices.png?v=6" alt="Commodity Spot Prices" />}
          />
        </div>
      </section>

      <section className="relative border-b border-metallic-700/60">
        <PhotoBackdrop src="/mining/headframe.jpg" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <FeatureRow
            eyebrow="News intelligence"
            title="AI-scored mining news from every exchange."
            body="3,500+ articles aggregated from ASX, TSX, JSE, NYSE and LSE — each scored for sentiment by AI. Spot material events, halts and production updates instantly."
            points={[
              'Real-time news feed with category tags: corporate, exploration, production, halt.',
              'AI sentiment scoring with confidence levels on every article.',
              'Material event detection: drilling, resource upgrades, raisings, management changes.',
              'Filter by exchange, ticker and date range.',
            ]}
            ctaLabel="Browse news"
            ctaHref="/news"
            mockup={<ScreenshotPreview src="/screenshots/news-hits.png?v=6" alt="News Hits" />}
          />
        </div>
      </section>

      {/* ═══ REAL DATA ═══ */}
      <section className="relative border-b border-metallic-700/60">
        <PhotoBackdrop src="/mining/stacker.jpg" opacity={0.14} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <SectionHeader
            eyebrow="Real data"
            title="See what's inside the platform."
            lede="Examples of the data and analysis you get access to — updated daily from five exchanges."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DataSample title="Drill intercepts" items={[
              { label: 'DEG.ASX', value: '9.2m @ 12.4 g/t Au' },
              { label: 'SLR.ASX', value: '15m @ 8.7 g/t Au' },
              { label: 'SFR.ASX', value: '22m @ 3.1% Cu' },
              { label: 'PLS.ASX', value: '18m @ 1.4% Li₂O' },
            ]} />
            <DataSample title="Orebody valuation" items={[
              { label: 'In-Situ Value', value: '$4.2B' },
              { label: 'Enterprise Value', value: '$1.8B' },
              { label: 'Price / ISV', value: '0.43x' },
              { label: 'Implied Discount', value: '57%' },
            ]} />
            <DataSample title="Sentiment score" items={[
              { label: 'Signal', value: 'INVEST' },
              { label: 'Sentiment 7d', value: '+0.72' },
              { label: 'News Hits 7d', value: '14' },
              { label: 'Material Events', value: '3' },
            ]} />
            <DataSample title="Commodity prices" items={[
              { label: 'Gold', value: '$2,650/oz' },
              { label: 'Copper', value: '$4.15/lb' },
              { label: 'Lithium', value: '$12,800/t' },
              { label: 'Uranium', value: '$63.50/lb' },
            ]} />
          </div>
        </div>
      </section>

      {/* ═══ MORE FEATURES ═══ */}
      <section className="relative border-b border-metallic-700/60 bg-metallic-800/30">
        <PhotoBackdrop src="/mining/loader-truck.jpg" opacity={0.14} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <SectionHeader
            eyebrow="Full feature set"
            title="Built for serious mining investors."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FileText, title: 'Announcement database', desc: '6,000+ ASX/TSX/JSE announcements parsed with AI — drill results, resource upgrades and production reports extracted automatically.' },
              { icon: Database, title: 'Resource estimates', desc: 'JORC-compliant resource data with Measured, Indicated and Inferred categories. Compare tonnage, grade and contained metal.' },
              { icon: Building2, title: 'Company deep dives', desc: 'Detailed profiles with financials, projects, resource tables, capital raisings and key personnel.' },
              { icon: Newspaper, title: 'Multi-exchange news', desc: 'Real-time aggregation from ASX, TSX, JSE, NYSE and LSE — filtered, categorised and sentiment-scored.' },
              { icon: DollarSign, title: 'Commodity intelligence', desc: 'Ask about any commodity sector — gold, copper, lithium, uranium — and get sector outlooks with company recommendations.' },
              { icon: Shield, title: 'Geoscience reports', desc: 'Country-level geological data from USGS, Geoscience Australia and mining ministry publications.' },
            ].map(f => (
              <PlainCard key={f.title}>
                <f.icon className="w-4 h-4 text-metallic-400 mb-3" />
                <h3 className="font-medium text-metallic-100 mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-metallic-400 leading-relaxed">{f.desc}</p>
              </PlainCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative border-b border-metallic-700/60">
        <PhotoBackdrop src="/mining/plant-sunset.jpg" opacity={0.12} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple, transparent pricing."
            lede="Start free. Upgrade when you need exports, API access and premium features."
            accent="gold"
          />
          <div className="grid lg:grid-cols-3 gap-5 max-w-5xl">
            <PriceCard
              name="Free"
              price="$0"
              period="/month"
              items={[
                'Browse 2,000+ companies',
                'Basic peer comparison',
                'Global map access',
                'AI Analyst (limited)',
                'Sentiment signals (view)',
              ]}
              cta="Get started"
              ctaHref="/register"
            />
            <PriceCard
              name="Professional"
              price="$49"
              period="/month"
              highlighted
              items={[
                'Everything in Free',
                'Unlimited AI Analyst',
                '50 saved peer sets',
                'CSV & JSON export',
                'API access (10k req/day)',
                'Price alerts & formulas',
                'Full map layers & export',
              ]}
              cta="Start 7-day trial"
              ctaHref="/pricing"
            />
            <PriceCard
              name="Enterprise"
              price="Custom"
              period=""
              items={[
                'Everything in Professional',
                'Unlimited everything',
                'White-label option',
                'Custom data feeds',
                'SSO integration',
                'Dedicated account manager',
              ]}
              cta="Contact sales"
              ctaHref="/contact"
            />
          </div>
          <p className="text-xs text-metallic-500 mt-6">
            Annual billing at $490/year (save $98). All plans include daily data updates.
          </p>
        </div>
      </section>

      {/* ═══ WHO IT'S FOR ═══ */}
      <section className="relative border-b border-metallic-700/60 bg-metallic-800/30">
        <PhotoBackdrop src="/mining/excavator-orange.jpg" opacity={0.14} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <SectionHeader
            eyebrow="Who it's for"
            title="Built for every mining investor."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, title: 'Retail investors', desc: 'Find opportunities before the crowd. AI does the reading.' },
              { icon: Award, title: 'Fund managers', desc: 'Screen 2,000+ companies, build peer sets, export data.' },
              { icon: Search, title: 'Analysts & researchers', desc: 'Standardised resource data, drill intercepts and sentiment.' },
              { icon: Building2, title: 'Mining companies', desc: 'Benchmark against peers, track competitors, monitor sector sentiment.' },
            ].map(p => (
              <PlainCard key={p.title}>
                <p.icon className="w-4 h-4 text-metallic-400 mb-3" />
                <h3 className="font-medium text-metallic-100 mb-2 text-sm">{p.title}</h3>
                <p className="text-xs text-metallic-400 leading-relaxed">{p.desc}</p>
              </PlainCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative">
        <PhotoBackdrop src="/mining/excavator-orange.jpg" opacity={0.18} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="max-w-2xl">
            <div className="text-[11px] tracking-[0.24em] uppercase text-accent-copper mb-3">Get started</div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-metallic-50 mb-4 leading-tight">
              Ready to find your next mining investment?
            </h2>
            <p className="text-metallic-400 text-sm leading-relaxed mb-7 max-w-lg">
              Join analysts, fund managers and investors who use InvestOre to discover undervalued mining companies and make data-driven decisions.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <CTA href="/register" variant="gold">Get started free</CTA>
              <CTA href="/pricing" variant="silver">Compare plans</CTA>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-metallic-500">
              <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" />Secure payments via Stripe</span>
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3" />No credit card required</span>
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3" />Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
