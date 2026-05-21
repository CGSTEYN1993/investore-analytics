'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Menu, X, User, LogOut, Settings, ChevronDown, BarChart3, Map, Newspaper, Brain, TrendingUp, BookOpen, Users, Gem, Bot } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { KillSwitchButton } from '@/components/trading/KillSwitchButton';
import { PlatformSwitcher } from '@/components/layout/PlatformSwitcher';

function NavDropdown({ label, items, pathname, onNavigate }: {
  label: string;
  items: { href: string; label: string; icon: React.ReactNode }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = items.some(item => pathname.startsWith(item.href));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          isActive ? 'text-accent-copper' : 'text-metallic-300 hover:text-metallic-100'
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-metallic-800/95 backdrop-blur-md rounded-lg shadow-xl border border-metallic-700/50 py-1 z-50">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { setOpen(false); onNavigate?.(); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                pathname.startsWith(item.href) 
                    ? 'text-accent-copper bg-accent-copper/10' 
                  : 'text-metallic-300 hover:text-metallic-100 hover:bg-metallic-700/50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const platformLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
  { href: '/map', label: 'Global Map', icon: <Map className="w-4 h-4" /> },
  { href: '/analysis/commodity-breakdown', label: 'Commodities', icon: <Gem className="w-4 h-4" /> },
  { href: '/analysis/sentiment', label: 'Signals', icon: <TrendingUp className="w-4 h-4" /> },
];

// Trading is admin-only during the closed beta. These links are appended to
// `platformLinks` for admin users only.
const adminTradingLinks = [
  { href: '/trading', label: 'Trading Bot', icon: <Bot className="w-4 h-4" /> },
  { href: '/trading/audit', label: 'Audit Log', icon: <Settings className="w-4 h-4" /> },
];

const researchLinks = [
  { href: '/news', label: 'News Feed', icon: <Newspaper className="w-4 h-4" /> },
  { href: '/peers', label: 'Peer Analysis', icon: <Users className="w-4 h-4" /> },
  { href: '/resources/mining-economics', label: 'Knowledge Base', icon: <BookOpen className="w-4 h-4" /> },
  { href: '/analysis/ai-analyst', label: 'AI Analyst', icon: <Brain className="w-4 h-4" /> },
];

export function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="bg-metallic-950/90 backdrop-blur-md sticky top-0 z-50 border-b border-metallic-800/50">
      <nav className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="InvestOre Analytics"
              width={160}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Platform switcher (Analysis ↔ Trading) */}
          {!isHomePage && <PlatformSwitcher />}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <NavDropdown
                  label="Platform"
                  items={user?.role === 'admin' ? [...platformLinks, ...adminTradingLinks] : platformLinks}
                  pathname={pathname}
                />
                <NavDropdown label="Research" items={researchLinks} pathname={pathname} />
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/about' ? 'text-accent-copper' : 'text-metallic-300 hover:text-metallic-100'
                  }`}
                >
                  About
                </Link>
                <Link
                  href="/pricing"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/pricing' ? 'text-accent-gold' : 'text-metallic-300 hover:text-metallic-100'
                  }`}
                >
                  Pricing
                </Link>
                <Link
                  href="/faq"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/faq' ? 'text-accent-copper' : 'text-metallic-300 hover:text-metallic-100'
                  }`}
                >
                  FAQ
                </Link>
                <Link
                  href="/contact"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/contact' ? 'text-accent-copper' : 'text-metallic-300 hover:text-metallic-100'
                  }`}
                >
                  Contact
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && <KillSwitchButton />}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-metallic-800/50 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-diamond-600 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-metallic-200">
                    {user?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-metallic-400" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-metallic-800/95 backdrop-blur-md rounded-lg shadow-xl border border-metallic-700/50 py-1 z-50">
                    <div className="px-4 py-2 border-b border-metallic-700/50">
                      <p className="text-sm font-medium text-metallic-100 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-accent-gold capitalize">
                        {user?.subscription_tier} plan
                      </p>
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-metallic-200 hover:bg-metallic-700/50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-metallic-700/50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : isHomePage ? (
              <>
                <Link
                  href="/login"
                  className="text-sm text-metallic-300 hover:text-metallic-100 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20"
                >
                  Get Started Free
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-metallic-800/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-metallic-300" />
            ) : (
              <Menu className="w-5 h-5 text-metallic-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-metallic-800/50">
            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-metallic-500">Platform</p>
                  {(user?.role === 'admin' ? [...platformLinks, ...adminTradingLinks] : platformLinks).map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname.startsWith(item.href) ? 'text-primary-400 bg-primary-500/10' : 'text-metallic-300 hover:bg-metallic-800/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  <p className="px-3 py-1.5 mt-2 text-xs font-semibold uppercase tracking-wider text-metallic-500">Research</p>
                  {researchLinks.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname.startsWith(item.href) ? 'text-primary-400 bg-primary-500/10' : 'text-metallic-300 hover:bg-metallic-800/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  <hr className="border-metallic-800/50 my-2" />
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {[
                    { href: '/about', label: 'About' },
                    { href: '/pricing', label: 'Pricing' },
                    { href: '/faq', label: 'FAQ' },
                    { href: '/contact', label: 'Contact' },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3 py-2.5 text-sm text-metallic-300 hover:text-metallic-100 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {isHomePage && (
                    <>
                      <hr className="border-metallic-800/50 my-2" />
                      <Link
                        href="/login"
                        className="px-3 py-2.5 text-sm text-metallic-300 hover:text-metallic-100 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="mx-3 mt-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-lg text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started Free
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
