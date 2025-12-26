import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BarChart3, Globe, Shield, Zap, TrendingUp, Database, Search, Terminal, Activity, Layers, PlayCircle, Brain, Sparkles, MessageSquare, AlertTriangle, Target } from 'lucide-react';
import TickerTape from '@/components/ui/TickerTape';
import MapInterfaceMockup from '@/components/dashboard/MapInterfaceMockup';

// Helper Components
function ModuleCard({ icon, title, description, stats }: { icon: React.ReactNode, title: string, description: string, stats: string[] }) {
  return (
    <div className="group bg-metallic-900 border border-metallic-800 p-8 rounded-xl hover:border-primary-500/50 transition-all hover:bg-metallic-800/80 hover:-translate-y-1 shadow-lg">
      <div className="mb-6 p-4 bg-metallic-950 rounded-xl w-fit border border-metallic-800 group-hover:border-primary-500/30 transition-colors shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-metallic-100 mb-3 group-hover:text-primary-400 transition-colors">{title}</h3>
      <p className="text-metallic-400 text-sm mb-8 leading-relaxed h-12">{description}</p>
      <div className="space-y-3 border-t border-metallic-800 pt-6">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center justify-between text-xs font-medium text-metallic-500">
            <span>{stat}</span>
            <div className="h-1.5 w-16 bg-metallic-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500/40 w-2/3 group-hover:bg-primary-500 transition-colors"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIFeatureCard({ icon, title, description, highlight }: { icon: React.ReactNode, title: string, description: string, highlight: string }) {
  return (
    <div className="group relative bg-metallic-900/50 backdrop-blur-sm border border-metallic-800 p-8 rounded-xl hover:border-primary-500/50 transition-all hover:bg-metallic-900/80">
      <div className="absolute top-0 right-0 px-3 py-1 bg-primary-500/20 text-primary-400 text-xs font-medium rounded-bl-xl rounded-tr-xl border-l border-b border-primary-500/30">
        {highlight}
      </div>
      <div className="mb-5 p-3 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-xl w-fit border border-primary-500/30 text-primary-400">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-metallic-100 mb-3 group-hover:text-primary-400 transition-colors">{title}</h3>
      <p className="text-metallic-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-metallic-950 min-h-screen flex flex-col">
      {/* Ticker Tape */}
      <TickerTape />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-metallic-800">
        {/* Background pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-metallic-900 via-metallic-950 to-metallic-950" />
          {/* Topographic pattern overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('/topo-pattern.svg')] bg-repeat" />
          <div className="absolute inset-0 bg-gradient-to-t from-metallic-950 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
            {/* Large Hero Logo */}
            <div className="mb-10">
              <Image
                src="/logo.png"
                alt="InvestOre Analytics"
                width={320}
                height={320}
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain drop-shadow-2xl"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/30 border border-primary-700/50 text-primary-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Live Market Data Active
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight mb-6">
              <span className="text-metallic-100">Discover the Hidden Value in</span>
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-accent-copper bg-clip-text text-transparent">
                Mining Assets
              </span>
            </h1>
            
            <p className="text-xl text-metallic-300 max-w-2xl leading-relaxed mb-10">
              The most advanced analytics platform for global resource valuation. 
              Filter, compare, and analyze peer groups with precision to make data-driven investment decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/register"
                className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-all shadow-[0_0_20px_rgba(15,118,110,0.3)] hover:shadow-[0_0_30px_rgba(15,118,110,0.5)] flex items-center justify-center gap-2"
              >
                Start Exploring
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 bg-transparent text-primary-400 font-semibold rounded-lg border border-primary-500/50 hover:bg-primary-900/20 hover:border-primary-400 transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Video Walkthrough
              </Link>
            </div>
          </div>

          {/* Map Interface Preview */}
          <div className="relative w-full max-w-6xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 via-accent-copper/20 to-primary-500/20 rounded-xl blur-lg opacity-50"></div>
            <MapInterfaceMockup />
          </div>
        </div>
      </section>

      {/* Data Grid Section */}
      <section id="modules" className="py-24 bg-metallic-950 border-b border-metallic-800 relative">
        <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] bg-repeat opacity-[0.02]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-metallic-100 mb-4">Comprehensive Market Intelligence</h2>
            <p className="text-metallic-400 max-w-2xl mx-auto">
              Our platform aggregates data from thousands of projects to provide you with a clear picture of the market landscape.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModuleCard
              icon={<BarChart3 className="w-8 h-8 text-primary-400" />}
              title="Peer Analytics"
              description="Create custom peer sets with multi-filter criteria and compare valuations across companies."
              stats={['P/NAV', 'EV/Resource', 'Grade %']}
            />
            <ModuleCard
              icon={<Zap className="w-8 h-8 text-accent-copper" />}
              title="Resource Norm"
              description="Standardized resource reporting (AuEq, CuEq, Li2CO3) for apples-to-apples comparison."
              stats={['Inferred', 'Indicated', 'Measured']}
            />
            <ModuleCard
              icon={<Globe className="w-8 h-8 text-blue-400" />}
              title="Geo-Spatial"
              description="Interactive project mapping with layers for infrastructure, geology, and jurisdiction risk."
              stats={['Fraser Index', 'Infra', 'Tenure']}
            />
            <ModuleCard
              icon={<Activity className="w-8 h-8 text-green-400" />}
              title="Market Sentiment"
              description="Real-time news aggregation and sentiment scoring to track market momentum."
              stats={['News Flow', 'Insider', 'Shorts']}
            />
          </div>
        </div>
      </section>

      {/* AI Differentiator Section */}
      <section className="py-24 bg-gradient-to-b from-metallic-950 via-primary-950/20 to-metallic-950 border-b border-metallic-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] bg-repeat opacity-[0.03]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/30 border border-primary-700/50 text-primary-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by AI
            </div>
            <h2 className="text-4xl font-bold text-metallic-100 mb-4">
              Your AI Research Analyst
            </h2>
            <p className="text-xl text-metallic-400 max-w-3xl mx-auto">
              While competitors give you raw data, InvestOre interprets it for you. Our AI reads every announcement, 
              flags opportunities, and explains why stocks are mispriced.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AIFeatureCard
              icon={<Brain className="w-7 h-7" />}
              title="Announcement Interpreter"
              description="AI parses dense technical reports and extracts key metrics, drill results, and resource updates in seconds."
              highlight="Save 5+ hours per week"
            />
            <AIFeatureCard
              icon={<MessageSquare className="w-7 h-7" />}
              title="Natural Language Search"
              description="Ask questions like 'Show me gold explorers in Canada with >1M oz resource trading below $50/oz'"
              highlight="No complex filters needed"
            />
            <AIFeatureCard
              icon={<Target className="w-7 h-7" />}
              title="Valuation Explainer"
              description="AI explains why Company X trades at 0.4x NAV vs peer average 0.7x — instant investment thesis."
              highlight="Understand the discount"
            />
            <AIFeatureCard
              icon={<AlertTriangle className="w-7 h-7" />}
              title="Risk Detection"
              description="Auto-detect red flags: jurisdiction risk, management changes, dilution patterns, insider selling."
              highlight="Protect your capital"
            />
            <AIFeatureCard
              icon={<Sparkles className="w-7 h-7" />}
              title="Opportunity Alerts"
              description="Get notified when a company announces results that historically lead to significant re-rates."
              highlight="Be first to act"
            />
            <AIFeatureCard
              icon={<Activity className="w-7 h-7" />}
              title="Sentiment Scoring"
              description="Aggregate news, social media, and insider activity into a daily sentiment score for each stock."
              highlight="Gauge market mood"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-metallic-900 to-metallic-950"></div>
        <div className="absolute inset-0 bg-[url('/topo-pattern.svg')] bg-repeat opacity-10" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-metallic-100 mb-6">Ready to uncover your next opportunity?</h2>
          <p className="text-xl text-metallic-400 mb-10">
            Join elite analysts and investors making data-driven decisions with InvestOre Analytics.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg rounded-lg hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-900/50"
          >
            Create Free Account
            <ArrowRight className="w-6 h-6 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
