import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BarChart3, Globe, Zap, TrendingUp, Activity, PlayCircle, Brain, Sparkles, Target, Gem, Map, Users, Newspaper, BookOpen, ChevronRight, Shield, Database } from 'lucide-react';
import TickerTape from '@/components/ui/TickerTape';
import MapInterfaceMockup from '@/components/dashboard/MapInterfaceMockup';
import HowItWorksSlider from '@/components/ui/HowItWorksSlider';
import VideoThumbnail from '@/components/ui/VideoThumbnail';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

// Snapshot Card — shows a realistic preview of a platform feature
function SnapshotCard({ icon, title, description, features, href, accent }: {
  icon: React.ReactNode; title: string; description: string; features: string[]; href: string; accent: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="bg-metallic-900/60 border border-metallic-800/60 rounded-xl overflow-hidden hover:border-primary-500/40 transition-all duration-300 hover:-translate-y-1">
        {/* Preview mockup */}
        <div className={`h-44 bg-gradient-to-br ${accent} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] bg-repeat opacity-10" />
          <div className="absolute inset-4 bg-metallic-950/80 rounded-lg backdrop-blur-sm border border-metallic-700/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
              <div className="w-2 h-2 rounded-full bg-green-400/60" />
              <span className="ml-2 text-[10px] text-metallic-500 font-mono">investore.app/{title.toLowerCase().replace(/\s/g, '-')}</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-metallic-700/50 rounded w-3/4" />
              <div className="h-2 bg-metallic-700/50 rounded w-1/2" />
              <div className="flex gap-1 mt-2">
                <div className="h-8 flex-1 bg-primary-500/20 rounded" />
                <div className="h-8 flex-1 bg-accent-copper/20 rounded" />
                <div className="h-8 flex-1 bg-blue-500/20 rounded" />
              </div>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <h3 className="text-lg font-semibold text-metallic-100 group-hover:text-primary-400 transition-colors">{title}</h3>
          </div>
          <p className="text-sm text-metallic-400 mb-3 leading-relaxed">{description}</p>
          <ul className="space-y-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-metallic-500">
                <ChevronRight className="w-3 h-3 text-primary-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  );
}

// Stat pill for hero
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-metallic-800/50 rounded-full border border-metallic-700/50">
      <span className="text-sm font-bold text-primary-400">{value}</span>
      <span className="text-xs text-metallic-400">{label}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-metallic-950 min-h-screen flex flex-col">
      {/* Ticker Tape */}
      <TickerTape />

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-metallic-900 via-metallic-950 to-metallic-950" />
          <div className="absolute inset-0 opacity-[0.15] bg-[url('/topo-pattern.svg')] bg-repeat" />
          <div className="absolute inset-0 bg-gradient-to-t from-metallic-950 via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/30 border border-primary-700/50 text-primary-400 text-xs font-medium mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500"></span>
              </span>
              Tracking 5 Exchanges · 2,000+ Companies
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
              <span className="text-metallic-100">Mining Intelligence,</span>
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-accent-copper bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>

            <p className="text-lg text-metallic-400 max-w-xl leading-relaxed mb-8">
              Filter, compare, and value mining companies across ASX, TSX, JSE, NYSE & LSE — 
              powered by AI that reads every announcement for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/register"
                className="px-7 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-all shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] flex items-center justify-center gap-2 text-sm"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#walkthrough"
                className="px-7 py-3.5 bg-transparent text-metallic-300 font-medium rounded-lg border border-metallic-700 hover:border-metallic-500 hover:text-metallic-100 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <PlayCircle className="w-4 h-4" />
                Watch Demo
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <StatPill value="6,000+" label="Announcements Parsed" />
              <StatPill value="AI" label="Powered Extraction" />
              <StatPill value="Live" label="Sentiment Signals" />
            </div>
          </div>

          {/* Map Preview */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/15 via-accent-copper/15 to-primary-500/15 rounded-xl blur-xl" />
            <div className="relative">
              <MapInterfaceMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platform Snapshots ─── */}
      <section className="py-20 border-t border-metallic-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">What You Get</span>
            <h2 className="text-3xl font-bold text-metallic-100 mb-3">Every Tool a Mining Investor Needs</h2>
            <p className="text-metallic-400 max-w-lg mx-auto text-sm">
              From drill results to peer valuations — all in one platform, updated daily.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SnapshotCard
              icon={<BarChart3 className="w-5 h-5 text-primary-400" />}
              title="Peer Analytics"
              description="Create custom peer groups and benchmark valuations across any filter set."
              features={['P/NAV & EV/Resource ratios', 'Multi-commodity comparison', 'Custom peer groups']}
              href="/analysis/compare"
              accent="from-primary-900/40 to-primary-950/60"
            />
            <SnapshotCard
              icon={<Zap className="w-5 h-5 text-accent-copper" />}
              title="Exploration Data"
              description="AI-extracted drill intercepts, resource estimates, and project updates."
              features={['6,000+ parsed announcements', 'Drill results database', 'Grade & thickness data']}
              href="/analysis/exploration"
              accent="from-amber-900/30 to-metallic-950/60"
            />
            <SnapshotCard
              icon={<Globe className="w-5 h-5 text-blue-400" />}
              title="Global Map"
              description="Interactive map with project pins, geology layers, and jurisdiction risk."
              features={['50+ countries covered', 'Infrastructure overlay', 'Geology & tenements']}
              href="/map"
              accent="from-blue-900/30 to-metallic-950/60"
            />
            <SnapshotCard
              icon={<Brain className="w-5 h-5 text-emerald-400" />}
              title="AI Analyst"
              description="Ask questions in plain English — get answers backed by real data."
              features={['Natural language queries', 'Sentiment analysis', 'Risk flag detection']}
              href="/analysis/ai-analyst"
              accent="from-emerald-900/30 to-metallic-950/60"
            />
            <SnapshotCard
              icon={<TrendingUp className="w-5 h-5 text-violet-400" />}
              title="Sentiment Signals"
              description="Real-time invest/divest signals generated from news flow and AI scoring."
              features={['Bullish/bearish alerts', 'News-driven triggers', 'Portfolio watchlist']}
              href="/analysis/sentiment"
              accent="from-violet-900/30 to-metallic-950/60"
            />
            <SnapshotCard
              icon={<Activity className="w-5 h-5 text-rose-400" />}
              title="News & Announcements"
              description="Every ASX, TSX & JSE announcement — filtered, categorised, and searchable."
              features={['Multi-exchange coverage', 'Category filtering', 'Full PDF extraction']}
              href="/news"
              accent="from-rose-900/30 to-metallic-950/60"
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 bg-metallic-900/20 border-t border-metallic-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">How It Works</span>
            <h2 className="text-3xl font-bold text-metallic-100 mb-4">
              From Raw Data to Investment Insight in Seconds
            </h2>
            <p className="text-metallic-400 text-sm leading-relaxed">
              InvestOre ingests thousands of company announcements, extracts the key metrics with AI, 
              and lets you filter, compare, and analyse — so you spend less time on spreadsheets.
            </p>
          </div>

          <HowItWorksSlider />
        </div>
      </section>

      {/* ─── Video Walkthrough ─── */}
      <section id="walkthrough" className="py-20 border-t border-metallic-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-2">
              <span className="text-primary-400 font-medium text-xs tracking-widest uppercase mb-3 block">See It In Action</span>
              <h2 className="text-3xl font-bold text-metallic-100 mb-4 leading-tight">
                3-Minute Platform Walkthrough
              </h2>
              <p className="text-metallic-400 text-sm leading-relaxed mb-6">
                See how InvestOre helps you discover undervalued mining companies, compare peer valuations, 
                and get AI-powered insights — all in one unified dashboard.
              </p>
              <div className="space-y-3">
                {[
                  { icon: <Target className="w-4 h-4" />, text: 'Filter by commodity, stage, exchange & market cap' },
                  { icon: <Users className="w-4 h-4" />, text: 'Build custom peer groups for side-by-side comparison' },
                  { icon: <Brain className="w-4 h-4" />, text: 'Ask the AI analyst anything about a company' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-metallic-300">
                    <div className="p-1.5 bg-primary-500/15 rounded text-primary-400">{item.icon}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <VideoThumbnail
                videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                title="InvestOre Analytics — Platform Walkthrough"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="py-10 border-t border-metallic-800/50 bg-metallic-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-metallic-500 text-sm">
            {[
              { label: 'ASX', sub: 'Australia' },
              { label: 'TSX', sub: 'Canada' },
              { label: 'JSE', sub: 'South Africa' },
              { label: 'NYSE', sub: 'United States' },
              { label: 'LSE', sub: 'United Kingdom' },
            ].map((exchange) => (
              <div key={exchange.label} className="flex items-center gap-2 px-4 py-2 bg-metallic-800/30 rounded-lg border border-metallic-700/30">
                <span className="font-bold text-metallic-300">{exchange.label}</span>
                <span className="text-xs text-metallic-500">·</span>
                <span className="text-xs text-metallic-500">{exchange.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Section ─── */}
      <section className="py-20 border-t border-metallic-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered
            </div>
            <h2 className="text-3xl font-bold text-metallic-100 mb-3">
              Your Personal Mining Analyst
            </h2>
            <p className="text-metallic-400 max-w-lg mx-auto text-sm">
              Ask anything — our AI reads every announcement and gives you data-backed answers in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: <Brain className="w-6 h-6" />,
                title: 'Ask in Plain English',
                description: '"Show me gold explorers in WA with drill results above 5 g/t"',
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI Reads Announcements',
                description: 'Every PDF parsed, key metrics extracted, sentiment scored automatically.',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Invest/Divest Signals',
                description: 'Real-time bullish and bearish signals based on news flow and AI analysis.',
              },
            ].map((card, i) => (
              <div key={i} className="bg-metallic-900/50 border border-metallic-800/50 rounded-xl p-6 hover:border-primary-500/30 transition-colors">
                <div className="p-2.5 bg-primary-500/10 rounded-lg w-fit text-primary-400 mb-4">{card.icon}</div>
                <h3 className="font-semibold text-metallic-100 mb-2">{card.title}</h3>
                <p className="text-sm text-metallic-400 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/analysis/ai-analyst"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Brain className="w-4 h-4" />
              Try the AI Analyst
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Newsletter ─── */}
      <section className="py-14 border-t border-metallic-800/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="card" />
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 relative overflow-hidden border-t border-metallic-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-metallic-900/50 to-metallic-950" />
        <div className="absolute inset-0 bg-[url('/topo-pattern.svg')] bg-repeat opacity-[0.06]" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-metallic-100 mb-4">
            Ready to find your next mining investment?
          </h2>
          <p className="text-metallic-400 mb-8 max-w-lg mx-auto">
            Join analysts, fund managers, and retail investors who use InvestOre to make smarter, data-driven decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-900/30 flex items-center justify-center gap-2 text-sm"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 text-metallic-300 font-medium rounded-lg border border-metallic-700 hover:border-metallic-500 hover:text-metallic-100 transition-all text-sm text-center"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
