// Minimal edge-compatible auth config for middleware
// No Prisma, no bcrypt, no zod - keeps bundle size under 1 MB

// eslint-disable-next-line @typescript-eslint/no-require-imports
const NextAuth = require('next-auth').default;

export const { auth: edgeAuth } = NextAuth({
  providers: [],
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    jwt({ token }: any) {
      return token;
    },

    session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'VIEWER' | 'EDITOR' | 'SUPER_USER';
        session.user.organization = token.organization as string | undefined;
      }
      return session;
    },
  },
});
