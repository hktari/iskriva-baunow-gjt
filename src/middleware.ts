import { edgeAuth } from '@/server/auth/edge';
import { NextResponse } from 'next/server';

export default edgeAuth((req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Redirect logged-in users away from login page
  if (nextUrl.pathname.startsWith('/login') && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // All other routes are publicly accessible
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
