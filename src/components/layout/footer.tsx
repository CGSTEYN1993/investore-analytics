import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-metallic-950 text-metallic-400 border-t border-metallic-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="InvestOre Analytics"
                width={36}
                height={36}
                className="w-9 h-9"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">
                  <span className="text-metallic-100">Invest</span>
                  <span className="text-accent-copper">Ore</span>
                </span>
                <span className="text-xs text-primary-400 -mt-0.5">Analytics</span>
              </div>
            </Link>
            <p className="text-sm text-metallic-500">
              Mining & exploration valuation analytics platform.
              Compare peer groups with transparent data.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-metallic-200 mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="hover:text-primary-400 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
              <li><Link href="/demo" className="hover:text-primary-400 transition-colors">Demo</Link></li>
              <li><Link href="/api" className="hover:text-primary-400 transition-colors">API</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-metallic-200 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="hover:text-primary-400 transition-colors">Documentation</Link></li>
              <li><Link href="/methodology" className="hover:text-primary-400 transition-colors">Methodology</Link></li>
              <li><Link href="/data-sources" className="hover:text-primary-400 transition-colors">Data Sources</Link></li>
              <li><Link href="/support" className="hover:text-primary-400 transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-metallic-200 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-primary-400 transition-colors">Disclaimer</Link></li>
              <li><Link href="/attribution" className="hover:text-primary-400 transition-colors">Data Attribution</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-metallic-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-metallic-500">
            © {new Date().getFullYear()} InvestOre Analytics. All rights reserved.
          </p>
          <p className="text-xs text-metallic-600">
            Data provided for informational purposes only. Not investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
