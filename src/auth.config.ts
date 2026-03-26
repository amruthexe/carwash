import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET || 'some-very-secret-key-1234567890',
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // @ts-ignore
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
