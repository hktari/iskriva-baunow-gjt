declare module 'next-auth' {
  interface User {
    id: string;
    role?: string;
    organization?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'VIEWER' | 'EDITOR' | 'SUPER_USER';
      organization?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    organization?: string;
  }
}
