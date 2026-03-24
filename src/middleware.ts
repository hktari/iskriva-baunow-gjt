import { auth } from '@/server/auth';
import { NextResponse } from 'next/server';

export default auth((req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthRoute = nextUrl.pathname.startsWith('/login');
  const isPublicRoute = nextUrl.pathname === '/login';

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
