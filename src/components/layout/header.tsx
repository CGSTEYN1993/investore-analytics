'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="bg-metallic-900/95 backdrop-blur-sm border-b border-metallic-700/50 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="InvestOre Analytics"
              width={180}
              height={60}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Common navigation links */}
            <Link
              href="/about"
              className="text-metallic-300 hover:text-primary-400 font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-metallic-300 hover:text-primary-400 font-medium transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className="text-metallic-300 hover:text-primary-400 font-medium transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="text-metallic-300 hover:text-primary-400 font-medium transition-colors"
            >
              Contact
            </Link>
            
            {isAuthenticated && (
              <>
                <div className="w-px h-5 bg-metallic-700" />
                <Link
                  href="/dashboard"
                  className="text-metallic-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/news"
                  className="text-metallic-300 hover:text-primary-400 font-medium transition-colors"
                >
                  News
                </Link>
                <Link
                  href="/peers"
                  className="text-metallic-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Peer Groups
                </Link>
                <Link
                  href="/map"
                  className="text-metallic-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Map
                </Link>
                <Link
                  href="/resources/mining-economics"
                  className="text-metallic-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Knowledge
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-metallic-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-diamond-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-metallic-200">
                    {user?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-metallic-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-metallic-800 rounded-lg shadow-xl border border-metallic-700 py-1">
                    <div className="px-4 py-2 border-b border-metallic-700">
                      <p className="text-sm font-medium text-metallic-100">
                        {user?.email}
                      </p>
                      <p className="text-xs text-accent-gold capitalize">
                        {user?.subscription_tier} plan
                      </p>
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-metallic-200 hover:bg-metallic-700"
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
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-metallic-700"
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
                  className="text-metallic-300 hover:text-metallic-100 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25"
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-metallic-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-metallic-300" />
            ) : (
              <Menu className="w-6 h-6 text-metallic-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-metallic-700">
            <div className="flex flex-col gap-4">
              {/* Common links */}
              <Link
                href="/about"
                className="text-metallic-300 hover:text-primary-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="text-metallic-300 hover:text-primary-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                className="text-metallic-300 hover:text-primary-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-metallic-300 hover:text-primary-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {isAuthenticated && (
                <>
                  <hr className="border-metallic-700" />
                  <Link
                    href="/dashboard"
                    className="text-metallic-300 hover:text-primary-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/news"
                    className="text-metallic-300 hover:text-primary-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    News
                  </Link>
                  <Link
                    href="/peers"
                    className="text-metallic-300 hover:text-primary-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Peer Groups
                  </Link>
                  <Link
                    href="/map"
                    className="text-metallic-300 hover:text-primary-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Map
                  </Link>
                  <Link
                    href="/resources/mining-economics"
                    className="text-metallic-300 hover:text-primary-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mining Knowledge
                  </Link>
                </>
              )}
              <hr className="border-metallic-700" />
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-red-400 font-medium text-left"
                >
                  Sign Out
                </button>
              ) : isHomePage ? (
                <>
                  <Link
                    href="/login"
                    className="text-metallic-300 hover:text-metallic-100 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
