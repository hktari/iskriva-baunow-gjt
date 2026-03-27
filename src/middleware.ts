import { edgeAuth } from '@/server/auth/edge';
import { NextResponse } from 'next/server';

// Edge-compatible UUID generation using Web Crypto API
function generateRequestId(): string {
  return crypto.randomUUID();
}

export default edgeAuth((req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Generate or extract request ID for correlation
  const requestId = req.headers.get('x-request-id') || generateRequestId();

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
