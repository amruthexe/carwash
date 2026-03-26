import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((request) => {
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
  if (pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
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
