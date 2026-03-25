import type { Session } from 'next-auth';
import type { NextRequest } from 'next/server';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }: {
      auth: Session | null;
      request: { nextUrl: NextRequest['nextUrl'] };
    }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnUsers = nextUrl.pathname.startsWith('/users');

      if (isOnUsers) {
        return isLoggedIn && auth.user.role === 'SUPER_USER';
      }

      if (isOnDashboard) {
        return isLoggedIn;
      }

      return true;
    },
  },
  providers: [],
} satisfies {
  pages: {
    signIn: string;
  };
  callbacks: {
    authorized: ({
      auth,
      request,
    }: {
      auth: Session | null;
      request: { nextUrl: NextRequest['nextUrl'] };
    }) => boolean;
  };
  providers: any[];
};
