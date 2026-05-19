'use client';

import Link from 'next/link';
import { CreditCard, User as UserIcon, Bell, Shield, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface SettingsLink {
  href: string;
  title: string;
  description: string;
  icon: typeof CreditCard;
  available: boolean;
}

const SETTINGS_LINKS: SettingsLink[] = [
  {
    href: '/settings/billing',
    title: 'Billing & Subscription',
    description: 'Manage your plan, payment methods, and invoices.',
    icon: CreditCard,
    available: true,
  },
  {
    href: '/settings/profile',
    title: 'Profile',
    description: 'Update your name, email, and password.',
    icon: UserIcon,
    available: false,
  },
  {
    href: '/settings/notifications',
    title: 'Notifications',
    description: 'Control email alerts and watchlist triggers.',
    icon: Bell,
    available: false,
  },
  {
    href: '/settings/security',
    title: 'Security',
    description: 'Two-factor auth and active sessions.',
    icon: Shield,
    available: false,
  },
];

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-metallic-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          {user?.email ? (
            <p className="mt-2 text-metallic-400">Signed in as {user.email}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          {SETTINGS_LINKS.map((link) => {
            const Icon = link.icon;
            const content = (
              <div
                className={`flex items-center justify-between rounded-xl border border-metallic-800 bg-metallic-900/50 p-5 transition-colors ${
                  link.available
                    ? 'hover:border-accent-gold/40 hover:bg-metallic-900'
                    : 'opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-metallic-800 text-accent-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{link.title}</h2>
                      {!link.available && (
                        <span className="rounded-full bg-metallic-800 px-2 py-0.5 text-xs uppercase tracking-wide text-metallic-400">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-metallic-400">{link.description}</p>
                  </div>
                </div>
                {link.available && <ChevronRight className="h-5 w-5 text-metallic-500" />}
              </div>
            );

            return link.available ? (
              <Link key={link.href} href={link.href} className="block">
                {content}
              </Link>
            ) : (
              <div key={link.href}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
