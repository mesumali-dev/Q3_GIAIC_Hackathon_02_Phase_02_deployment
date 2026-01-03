/**
 * Next.js Middleware for Route Protection
 *
 * Note: Since we use localStorage for token storage (client-side only),
 * this middleware cannot check authentication state directly.
 * Route protection is handled client-side in the page components.
 *
 * This middleware:
 * - Allows all routes to pass through
 * - Excludes API routes and static files from processing
 *
 * Client-side route protection is implemented in:
 * - /src/app/page.tsx (checks auth on load)
 * - Components redirect to /login when unauthorized
 *
 * @see specs/003-backend-auth-refactor
 */

import { NextRequest, NextResponse } from "next/server";

// API routes to exclude from middleware
const apiRoutes = ["/api/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // All routes pass through - client-side handles auth checks
  // This is because localStorage is not accessible in middleware (server-side)
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
