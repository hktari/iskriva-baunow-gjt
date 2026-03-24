import { authConfig } from './config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const NextAuth = require('next-auth').default;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
