import React from 'react';
import { Target, Users, Globe, Award, TrendingUp, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-metallic-900 via-metallic-950 to-metallic-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-metallic-100 mb-6">
              About <span className="text-primary-400">InvestOre</span> Analytics
            </h1>
            <p className="text-xl text-metallic-400 leading-relaxed">
              Empowering investors with institutional-grade mining intelligence and AI-driven analytics to make smarter investment decisions in the resources sector.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-metallic-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-metallic-100 mb-6">Our Mission</h2>
              <p className="text-metallic-400 leading-relaxed mb-6">
                InvestOre Analytics was founded with a singular vision: to democratize access to professional-grade mining sector intelligence. We believe that every investor deserves access to the same quality of data and analysis tools that were once exclusive to institutional investors.
              </p>
              <p className="text-metallic-400 leading-relaxed">
                Our platform combines decades of mining industry expertise with cutting-edge artificial intelligence to deliver actionable insights that help you navigate the complex world of resource investments.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-400 mb-2">50K+</div>
                <div className="text-metallic-400 text-sm">Mining Projects</div>
              </div>
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-400 mb-2">180+</div>
                <div className="text-metallic-400 text-sm">Countries Covered</div>
              </div>
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-400 mb-2">30+</div>
                <div className="text-metallic-400 text-sm">Commodities Tracked</div>
              </div>
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-400 mb-2">24/7</div>
                <div className="text-metallic-400 text-sm">Real-time Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-metallic-100 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-metallic-100 mb-3">Accuracy</h3>
              <p className="text-metallic-400 text-sm leading-relaxed">
                We maintain the highest standards of data accuracy, sourcing information directly from official filings, technical reports, and verified databases.
              </p>
            </div>
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-metallic-100 mb-3">Transparency</h3>
              <p className="text-metallic-400 text-sm leading-relaxed">
                We believe in full transparency. Every data point is traceable to its source, allowing you to verify and trust the information you receive.
              </p>
            </div>
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-metallic-100 mb-3">Innovation</h3>
              <p className="text-metallic-400 text-sm leading-relaxed">
                We continuously innovate, leveraging AI and machine learning to provide insights that were previously impossible to generate at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-metallic-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-metallic-100 mb-4">Built by Industry Experts</h2>
            <p className="text-metallic-400">
              Our team combines deep expertise in mining finance, geology, data science, and software engineering to deliver a platform that truly serves the needs of resource investors.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: 'Global Coverage', desc: 'Mining projects worldwide' },
              { icon: Users, title: 'Expert Team', desc: 'Industry professionals' },
              { icon: Award, title: 'Quality Data', desc: 'Verified & reliable' },
              { icon: Shield, title: 'Secure Platform', desc: 'Enterprise security' },
            ].map((item, i) => (
              <div key={i} className="bg-metallic-900 border border-metallic-800 rounded-xl p-6 text-center">
                <item.icon className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                <h3 className="font-semibold text-metallic-100 mb-1">{item.title}</h3>
                <p className="text-metallic-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-metallic-100 mb-6">
            Ready to Transform Your Mining Research?
          </h2>
          <p className="text-metallic-400 mb-8 text-lg">
            Join thousands of investors who trust InvestOre Analytics for their mining sector intelligence.
          </p>
          <a
            href="/register"
            className="inline-flex px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25"
          >
            Start Free Trial
          </a>
        </div>
      </section>
    </div>
  );
}
