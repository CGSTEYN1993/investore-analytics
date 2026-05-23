import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-metallic-900 text-metallic-300 relative">
      <div className="metal-divider" />
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.png"
                alt="InvestOre Analytics"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div className="flex flex-col">
                <span className="font-bold text-base leading-tight">
                  <span className="text-metallic-100">Invest</span>
                  <span className="text-accent-copper">Ore</span>
                </span>
                <span className="text-[10px] text-metallic-400 tracking-wider -mt-0.5">Analytics</span>
              </div>
            </Link>
            <p className="text-xs text-metallic-500 mb-4 leading-relaxed">
              Mining & exploration analytics platform. Compare peer groups, track announcements, and discover opportunities.
            </p>
            {/* Exchange badges */}
            <div className="flex flex-wrap gap-1.5">
              {['ASX', 'TSX', 'JSE', 'NYSE', 'LSE'].map(ex => (
                <span key={ex} className="px-2 py-0.5 text-[10px] font-semibold bg-metallic-800/50 text-metallic-400 rounded border border-metallic-700/30">
                  {ex}
                </span>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-metallic-200 text-sm mb-4">Product</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-accent-copper transition-colors">Dashboard</Link></li>
              <li><Link href="/analysis/compare" className="hover:text-accent-copper transition-colors">Peer Analytics</Link></li>
              <li><Link href="/analysis/ai-analyst" className="hover:text-accent-copper transition-colors">AI Analyst</Link></li>
              <li><Link href="/map" className="hover:text-accent-copper transition-colors">Global Map</Link></li>
              <li><Link href="/pricing" className="hover:text-accent-gold transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-metallic-200 text-sm mb-4">Resources</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/resources/mining-economics" className="hover:text-accent-copper transition-colors">Knowledge Base</Link></li>
              <li><Link href="/news" className="hover:text-accent-copper transition-colors">News Feed</Link></li>
              <li><Link href="/faq" className="hover:text-accent-copper transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-accent-copper transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-metallic-200 text-sm mb-4">Legal</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-metallic-200 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-metallic-200 transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-metallic-200 transition-colors">Disclaimer</Link></li>
              <li><Link href="/about" className="hover:text-metallic-200 transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="metal-divider mt-10 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-metallic-600">
            © {new Date().getFullYear()} <span className="font-display italic text-metallic-400">InvestOre</span> Analytics. All rights reserved.
          </p>
          <p className="text-[10px] text-metallic-700 tracking-wide uppercase">
            Data for informational purposes only · Not investment advice
          </p>
        </div>
      </div>
    </footer>
  );
}
