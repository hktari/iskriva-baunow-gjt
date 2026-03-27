import { edgeAuth } from '@/server/auth/edge';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export default edgeAuth((req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Generate or extract request ID for correlation
  const requestId = req.headers.get('x-request-id') || randomUUID();

  // Redirect logged-in users away from login page
  if (nextUrl.pathname.startsWith('/login') && isLoggedIn) {
    const response = NextResponse.redirect(new URL('/', nextUrl));
    response.headers.set('x-request-id', requestId);
    return response;
  }

  // All other routes are publicly accessible
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  return response;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
