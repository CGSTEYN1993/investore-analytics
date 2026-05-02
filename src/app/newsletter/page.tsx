import NewsletterSignup from '@/components/ui/NewsletterSignup';

export const metadata = {
  title: 'Pre-Market Mining Report — InvestOre Analytics',
  description: 'Daily pre-open bullish/bearish outlook for ASX, TSX, JSE, LSE & NYSE mining stocks. Segmented by commodity and market cap. Free, double opt-in, unsubscribe anytime.',
};

export default function NewsletterPage() {
  return (
    <main className="min-h-[70vh] py-12 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-metallic-50 mb-3">
            The Pre-Market Mining Report
          </h1>
          <p className="text-metallic-400 text-base leading-relaxed max-w-xl mx-auto">
            Every trading day, 45 minutes before each exchange opens, we send a clear bullish/bearish
            outlook segmented by commodity and market cap — built from every news, sentiment and
            cross-exchange signal we track.
          </p>
        </div>
        <NewsletterSignup variant="hero" />

        <div className="mt-12 grid sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl border border-metallic-800 bg-metallic-900/30">
            <div className="text-2xl font-bold text-primary-400 mb-1">5</div>
            <div className="text-xs text-metallic-400 uppercase tracking-wide">Exchanges Covered</div>
          </div>
          <div className="p-4 rounded-xl border border-metallic-800 bg-metallic-900/30">
            <div className="text-2xl font-bold text-primary-400 mb-1">11</div>
            <div className="text-xs text-metallic-400 uppercase tracking-wide">Commodities Tracked</div>
          </div>
          <div className="p-4 rounded-xl border border-metallic-800 bg-metallic-900/30">
            <div className="text-2xl font-bold text-primary-400 mb-1">45 min</div>
            <div className="text-xs text-metallic-400 uppercase tracking-wide">Before Each Open</div>
          </div>
        </div>
      </div>
    </main>
  );
}
