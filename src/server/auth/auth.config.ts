import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
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
} satisfies NextAuthConfig;
