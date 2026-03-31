import { auth } from "@/auth";
import { NextResponse } from 'next/server';

/**
 * Next.js 16+ Proxy (formerly Middleware) logic.
 * Corrected to use auth from @/auth for proper session management.
 */
export const proxy = auth((request) => {
  const session = request.auth;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login');
  
  if (isAuthPage && session) {
    // @ts-ignore
    const role = session.user?.role;
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'worker') return NextResponse.redirect(new URL('/worker', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect Customer Routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    // @ts-ignore
    const role = session.user?.role;
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'worker') return NextResponse.redirect(new URL('/worker', request.url));
  }

  // Protect Worker Routes
  if (pathname.startsWith('/worker')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    // @ts-ignore
    if (session.user?.role !== 'worker' && session.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    // @ts-ignore
    if (session.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/worker/:path*', '/admin/:path*', '/login'],
};
