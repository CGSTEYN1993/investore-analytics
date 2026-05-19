/**
 * InvestOre Analytics - Next.js Middleware for Route Protection
 * 
 * This middleware runs on every request and:
 * 1. Checks authentication status for protected routes
 * 2. Redirects unauthenticated users to login
 * 3. Prevents authenticated users from accessing login/register pages
 * 4. Validates JWT tokens for protected routes
 *
 * Policy: ANY route that is not in PUBLIC_ROUTES requires authentication.
 * The home page and a handful of marketing/legal pages are open; everything
 * else (analysis, company, news, watchlist, peers, dashboard, trading, …)
 * forces the visitor through /login first so per-user state (watchlists,
 * preferences, peer sets) is always tied to a logged-in account.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/auth',          // OAuth callback flow
];

// The ONLY routes that don't require authentication.
// Everything not listed here will redirect to /login when no valid token
// is present.
const PUBLIC_ROUTES = [
  '/',              // Landing page
  '/about',
  '/pricing',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/disclaimer',
];

// Routes that require an ADMIN role on top of being authenticated.
// Non-admin authenticated users are redirected to the coming-soon page.
const ADMIN_ROUTES = [
  '/trading',
];

// The user-visible landing page for non-admin visitors who try /trading
const TRADING_COMING_SOON_PATH = '/trading/coming-soon';

// Authenticated routes that FREE-tier users are allowed to access.
// Everything else (analyst tooling, watchlist, dashboard, peers, etc.)
// is Pro-only and will redirect free users to /pricing.
//
// NOTE: This is an *allowlist* on top of the already-authenticated set, so
// new pages added in the future default to Pro-only — safer than a
// blocklist that could accidentally expose paid features.
const FREE_TIER_ALLOWED_ROUTES = [
  // Core free product surfaces (the five features sold on /pricing)
  '/analysis',                       // analysis index page
  '/analysis/ai-analyst',            // AI Research Analyst (rate-limited in-page)
  '/analysis/prices',                // Commodity spot prices (read-only)
  '/analysis/exchanges',             // Cross-Exchange Intelligence (read-only)
  '/analysis/commodities',           // Per-commodity drill-downs
  '/analysis/commodity-breakdown',   // Top-5 preview, paywall after
  '/news',                           // News hits (read-only)

  // Detail pages users naturally land on from the free surfaces
  '/commodity',                      // /commodity/[id]
  '/company',                        // /company/[ticker]

  // Account / billing / onboarding (so free users can upgrade)
  '/subscription',
  '/settings',
  '/onboarding',

  // Help / docs / legal-adjacent
  '/support',
  '/docs',
  '/methodology',
  '/attribution',
  '/data-sources',

  // Self-service auth flows
  '/verify-email',
  '/reset-password',
];

// API routes that should bypass middleware
const API_ROUTES = ['/api'];

/**
 * Check if a path matches any route in the list (prefix matching).
 * '/foo' matches '/foo' and '/foo/anything', but not '/foobar'.
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(route =>
    path === route || path.startsWith(`${route}/`)
  );
}

/**
 * Decode JWT token to check expiration (client-side validation)
 * Note: Full validation happens on the backend
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );

    if (!payload.exp) return true;

    // Add 60 second buffer for clock skew
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now - 60;
  } catch {
    return true;
  }
}

/**
 * Best-effort role extraction from a JWT payload. Returns lower-case role
 * string ('admin', 'analyst', 'viewer', …) or null.
 */
function getRoleFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    const role = payload.role;
    return typeof role === 'string' ? role.toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Extract subscription tier from JWT payload. Returns 'free' when missing
 * so we err on the side of restricting access until the user upgrades.
 */
function getTierFromToken(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 'free';
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    const tier = payload.tier;
    return typeof tier === 'string' ? tier.toLowerCase() : 'free';
  } catch {
    return 'free';
  }
}

/**
 * Get authentication token from request cookies or headers
 */
function getAuthToken(request: NextRequest): string | null {
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  if (tokenFromCookie) return tokenFromCookie;

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||  // Static files
    matchesRoute(pathname, API_ROUTES)
  ) {
    return NextResponse.next();
  }

  const token = getAuthToken(request);
  const isAuthenticated = !!token && !isTokenExpired(token);

  // Auth pages — if already logged in, bounce to the app
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/analysis', request.url));
    }
    return NextResponse.next();
  }

  // Public marketing/legal pages — always allow
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Everything else requires authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    loginUrl.searchParams.set('reason', 'auth_required');

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }

  // Admin-only routes (currently the entire /trading platform). Authenticated
  // non-admin users are bounced to the Coming Soon splash so existing trading
  // code stays accessible to admins for ongoing work.
  if (matchesRoute(pathname, ADMIN_ROUTES) && pathname !== TRADING_COMING_SOON_PATH) {
    const role = token ? getRoleFromToken(token) : null;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL(TRADING_COMING_SOON_PATH, request.url));
    }
  }

  // Subscription-tier gate: free users may only access the allowlisted
  // surfaces. Admin users bypass the gate so internal operators can use
  // the full product regardless of billing state. Everything else is Pro.
  const tier = token ? getTierFromToken(token) : 'free';
  const role = token ? getRoleFromToken(token) : null;
  if (tier === 'free' && role !== 'admin' && !matchesRoute(pathname, FREE_TIER_ALLOWED_ROUTES)) {
    const pricingUrl = new URL('/pricing', request.url);
    pricingUrl.searchParams.set('returnUrl', pathname);
    pricingUrl.searchParams.set('reason', 'upgrade_required');
    return NextResponse.redirect(pricingUrl);
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
