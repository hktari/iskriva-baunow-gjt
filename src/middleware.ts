import { auth } from '@/server/auth';

export default auth(() => {
  // Middleware logic handled by authConfig callbacks
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
