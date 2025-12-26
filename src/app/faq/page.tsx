'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // General
  {
    category: 'General',
    question: 'What is InvestOre Analytics?',
    answer: 'InvestOre Analytics is a comprehensive mining intelligence platform that provides institutional-grade data, analytics, and AI-powered insights for investors in the resources sector. We cover over 50,000 mining projects across 180+ countries, tracking 30+ commodities including gold, copper, lithium, and more.',
  },
  {
    category: 'General',
    question: 'Who is InvestOre Analytics designed for?',
    answer: 'Our platform is designed for individual investors, financial analysts, fund managers, mining professionals, and anyone who needs reliable data and insights on the global mining sector. Whether you\'re a retail investor researching junior miners or an institutional analyst covering major producers, our platform scales to your needs.',
  },
  {
    category: 'General',
    question: 'What makes InvestOre different from other platforms?',
    answer: 'InvestOre combines comprehensive mining data with AI-powered analytics that were previously only available to large institutions. Our unique features include peer group comparisons, AI-driven valuation models, interactive global mining maps, and natural language querying of complex datasets.',
  },
  // Data & Coverage
  {
    category: 'Data & Coverage',
    question: 'What data sources do you use?',
    answer: 'We aggregate data from multiple authoritative sources including official company filings (SEDAR, EDGAR, ASX), technical reports (NI 43-101, JORC), geological surveys, commodity exchanges, and regulatory databases. All data is verified and updated in real-time where available.',
  },
  {
    category: 'Data & Coverage',
    question: 'How often is the data updated?',
    answer: 'Market data and stock prices are updated in real-time during trading hours. Company fundamentals and project data are updated within 24-48 hours of official announcements. Our AI continuously monitors news and filings to ensure you have the latest information.',
  },
  {
    category: 'Data & Coverage',
    question: 'Which commodities do you cover?',
    answer: 'We cover 30+ commodities including precious metals (gold, silver, platinum, palladium), base metals (copper, zinc, nickel, lead), battery metals (lithium, cobalt, graphite), bulk commodities (iron ore, coal), and specialty minerals (rare earths, uranium, tungsten).',
  },
  // Features
  {
    category: 'Features',
    question: 'What is the AI Mining Analyst?',
    answer: 'Our AI Mining Analyst is a conversational interface powered by advanced language models trained on mining industry data. You can ask natural language questions like "What are the top copper developers in Chile by resource size?" and receive instant, data-backed answers.',
  },
  {
    category: 'Features',
    question: 'How does peer comparison work?',
    answer: 'Our peer comparison tool allows you to benchmark any mining company against similar companies based on criteria like commodity, stage of development, geography, and market cap. This helps identify relative value and spot investment opportunities.',
  },
  {
    category: 'Features',
    question: 'Can I export data from the platform?',
    answer: 'Yes! Professional and Enterprise subscribers can export data in multiple formats including CSV, Excel, and PDF. You can export company profiles, peer comparisons, screening results, and custom reports.',
  },
  // Pricing & Subscriptions
  {
    category: 'Pricing & Subscriptions',
    question: 'Do you offer a free trial?',
    answer: 'Yes, we offer a 14-day free trial of our Professional plan with full access to all features. No credit card required to start. You can also use our Free tier indefinitely with limited access to basic features.',
  },
  {
    category: 'Pricing & Subscriptions',
    question: 'Can I cancel my subscription at any time?',
    answer: 'Absolutely. You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you won\'t be charged again.',
  },
  {
    category: 'Pricing & Subscriptions',
    question: 'Do you offer discounts for annual subscriptions?',
    answer: 'Yes, annual subscriptions receive a 20% discount compared to monthly billing. This is automatically applied when you select annual billing during checkout.',
  },
  // Technical
  {
    category: 'Technical',
    question: 'Is my data secure?',
    answer: 'Security is our top priority. We use enterprise-grade encryption (AES-256) for all data, secure authentication with optional two-factor authentication, and our infrastructure is hosted on SOC 2 compliant cloud providers. We never sell or share your personal data.',
  },
  {
    category: 'Technical',
    question: 'What browsers are supported?',
    answer: 'InvestOre Analytics works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience. Our platform is also fully responsive and works on tablets and mobile devices.',
  },
];

const categories = ['All', 'General', 'Data & Coverage', 'Features', 'Pricing & Subscriptions', 'Technical'];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-metallic-800 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between bg-metallic-900 hover:bg-metallic-800/80 transition-colors text-left"
      >
        <span className="font-medium text-metallic-100 pr-4">{item.question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-primary-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-metallic-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-5 bg-metallic-900/50 border-t border-metallic-800">
          <p className="text-metallic-400 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-metallic-900 via-metallic-950 to-metallic-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-primary-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-metallic-100 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-metallic-400 leading-relaxed">
              Find answers to common questions about InvestOre Analytics, our features, pricing, and more.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setOpenIndex(0);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-metallic-900 text-metallic-400 hover:bg-metallic-800 hover:text-metallic-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <FAQAccordion
                key={index}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-metallic-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-metallic-100 mb-4">
            Still have questions?
          </h2>
          <p className="text-metallic-400 mb-8">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
