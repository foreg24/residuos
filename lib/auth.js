import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import Credentials from 'next-auth/providers/credentials';
import { getUserByEmail, createUser, verifyPassword } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        if (!email || !password) return null;

        const user = await getUserByEmail(email);
        if (!user) return null;
        if (!user.password) return null; // OAuth user trying to use password

        const valid = await verifyPassword(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image || null,
          onboardingDone: user.onboardingDone,
        };
      },
    }),
  ],
  pages: { signIn: '/', error: '/' },
  callbacks: {
    async signIn({ user, account }) {
      // Para OAuth (Google/Apple): crear usuario en DB si no existe
      if (account?.provider !== 'credentials') {
        try {
          const existing = await getUserByEmail(user.email);
          if (!existing) {
            await createUser({
              name: user.name,
              email: user.email,
              provider: account.provider,
              image: user.image,
            });
          }
        } catch (e) {
          console.error('Error creating OAuth user:', e);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider || 'credentials';
        token.onboardingDone = user.onboardingDone ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.provider = token.provider;
        session.user.onboardingDone = token.onboardingDone;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
