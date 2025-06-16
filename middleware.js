// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Define paths that are considered private and require authentication
  const privatePaths = ['/dashboard', '/hr/dashboard', '/select-role'];
  const { pathname } = req.nextUrl;

  // Check if the current path is a private path
  const pathIsPrivate = privatePaths.some(path => pathname.startsWith(path));

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // --- Logic for Private Paths ---
  if (pathIsPrivate) {
    // If the user is not authenticated, redirect to the sign-in page
    if (!token) {
      const signInUrl = new URL("/api/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // User is authenticated, now apply role-based logic
    const { role } = token;

    // If user has a role but is on the select-role page, redirect to their dashboard
    if (role && pathname === '/select-role') {
      const url = role === 'hr' ? '/hr/dashboard' : '/dashboard';
      return NextResponse.redirect(new URL(url, req.url));
    }
    
    // If user has no role but is trying to access a dashboard, force them to select a role
    if (!role && pathname !== '/select-role') {
      return NextResponse.redirect(new URL('/select-role', req.url));
    }

    // Enforce dashboard access control
    if (pathname.startsWith('/hr/dashboard') && role !== 'hr') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (pathname.startsWith('/dashboard') && role === 'hr') {
        return NextResponse.redirect(new URL('/hr/dashboard', req.url));
    }
  }

  // --- Logic for Public Paths (like the homepage '/') ---
  // Optional: For a better UX, if a logged-in user visits the homepage,
  // redirect them to their appropriate dashboard or role selection page.
  if (token && pathname === '/') {
      const { role } = token;
      if (role) {
          const url = role === 'hr' ? '/hr/dashboard' : '/dashboard';
          return NextResponse.redirect(new URL(url, req.url));
      } else {
          // If they have a token but no role, they must select one
          return NextResponse.redirect(new URL('/select-role', req.url));
      }
  }

  // If none of the above, allow the request to proceed (e.g., for public pages)
  return NextResponse.next();
}

// The matcher should cover all pages so the logic can decide what to do.
// We exclude asset/API paths for performance.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};