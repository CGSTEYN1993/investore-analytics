/**
 * InvestOre Analytics - Next.js Middleware for Route Protection
 * 
 * This middleware runs on every request and:
 * 1. Checks authentication status for protected routes
 * 2. Redirects unauthenticated users to login
 * 3. Prevents authenticated users from accessing login/register pages
 * 4. Validates JWT tokens for protected routes
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/portfolio',
  '/watchlist',
  '/peers',
  '/subscription',
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
];

// Public routes that don't require any authentication
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/features',
  '/faq',
  '/docs',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/methodology',
  '/data-sources',
  '/attribution',
  '/support',
  '/resources',
  '/demo',
  '/analysis',  // Analysis pages are publicly accessible
  '/company',   // Company pages are publicly accessible
  '/news',      // News pages are publicly accessible
];

// API routes that should bypass middleware
const API_ROUTES = ['/api'];

/**
 * Check if a path matches any route in the list (prefix matching)
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
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode the payload (base64url)
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    
    // Check expiration
    if (!payload.exp) return true;
    
    // Add 60 second buffer for clock skew
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now - 60;
  } catch {
    return true;
  }
}

/**
 * Get authentication token from request cookies or headers
 */
function getAuthToken(request: NextRequest): string | null {
  // Try to get from cookie first (most secure)
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  if (tokenFromCookie) return tokenFromCookie;
  
  // Fallback to Authorization header
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
  
  // Check for authentication token
  const token = getAuthToken(request);
  const isAuthenticated = token && !isTokenExpired(token);
  
  // Handle protected routes - require authentication
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      loginUrl.searchParams.set('reason', 'auth_required');
      
      const response = NextResponse.redirect(loginUrl);
      
      // Clear any invalid tokens
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      
      return response;
    }
    
    // User is authenticated, allow access
    return NextResponse.next();
  }
  
  // Handle auth routes - redirect to dashboard if already authenticated
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (isAuthenticated) {
      // Redirect authenticated users away from login/register
      return NextResponse.redirect(new URL('/analysis', request.url));
    }
    
    return NextResponse.next();
  }
  
  // Public routes - allow access
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
