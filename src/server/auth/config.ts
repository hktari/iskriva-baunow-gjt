import { UserStatus } from '@/generated/prisma/client';
import { db } from '@/shared/lib/db';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isOnUsers = nextUrl.pathname.startsWith('/users');
      const isOnAnalytics = nextUrl.pathname.startsWith('/analytics');
      const isAuthRoute = nextUrl.pathname.startsWith('/login');

      if (isAuthRoute) {
        return true;
      }

      if (isOnUsers) {
        return isLoggedIn && auth.user.role === 'SUPER_USER';
      }

      if (isOnAnalytics || nextUrl.pathname === '/') {
        return isLoggedIn;
      }

      return true;
    },

    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role as string;
        token.organization = user.organization;
      }
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
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user?.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        // Activate user on first successful login (accepting invitation)
        if (user.status === UserStatus.PENDING) {
          await db.user.update({
            where: { id: user.id },
            data: { status: UserStatus.ACTIVE },
          });
          await db.auditLog.create({
            data: {
              action: 'INVITATION_ACCEPTED',
              entityType: 'User',
              entityId: user.id,
              userId: user.id,
              userEmail: user.email,
              metadata: {
                userEmail: user.email,
                via: 'first-login',
              },
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organization: user.organization,
        };
      },
    }),
  ],
};
