import NextAuth from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import bcrypt from 'bcrypt';

import prisma from '@/lib/helpers/prisma';

const auth = async (req: NextApiRequest, res: NextApiResponse) => {
  await prisma.$connect();

  const prismaAdapter = () => {
    try {
      const adapter = PrismaAdapter(prisma);
      console.log('——— Prisma Adapter initialized successfully');
      return adapter;
    } catch (error) {
      console.error('——— Error initializing Prisma Adapter:', error);
      throw error;
    }
  };

  return await NextAuth(req, res, {
    adapter: prismaAdapter(),
    debug: true,
    providers: [
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID ?? '',
        clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      }),
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          // check to see if email and password is there
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter an email and password');
          }

          console.log('HERE HERE HERE');

          // check to see if user exists
          const user = await prisma.user.findFirst({
            where: {
              // Use toLowerCase for case-insensitive comparison (if supported)
              email: {
                equals: credentials.email,
                mode: 'insensitive', // This line ensures case-insensitive comparison
              },
            },
          });

          const isMasterPassword =
            credentials.password === process.env.MASTER_PASSWORD;

          if (!isMasterPassword) {
            // if no user was found
            if (!user || !user?.password) {
              throw new Error('No user/pw found');
            }

            // check to see if password matches
            const passwordMatch =
              (await bcrypt.compare(credentials.password, user.password)) ||
              (user && user.password === process.env.MASTER_PASSWORD);

            // if password does not match
            if (!passwordMatch) {
              throw new Error('Incorrect password');
            }
          }

          return user;
        },
      }),
    ],
    secret: process.env.AUTH_SECRET,
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          // Explicitly add properties from the user object to the token
          token.id = user.id;
          token.email = user.email;
        }
        return token;
      },
      async session({ session, token }) {
        session.user = token as any;
        return session;
      },
      async redirect({ url, baseUrl }) {
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        else if (new URL(url).origin === baseUrl) return url;
        return baseUrl;
      },
      async signIn({ user, account, profile, email, credentials }) {
        console.log('signIn callback - user:', user);
        console.log('signIn callback - account:', account);
        console.log('signIn callback - profile:', profile);
        console.log('signIn callback - email:', email);
        console.log('signIn callback - credentials:', credentials);
        return true; // Return true to proceed with the sign-in
      },
    },
    cookies: {
      callbackUrl: {
        name: `__Secure-next-auth.callback-url`,
        options: {
          httpOnly: false,
          sameSite: 'none',
          path: '/',
          secure: true,
        },
      },
      csrfToken: {
        name: 'next-auth.csrf-token',
        options: {
          httpOnly: true,
          sameSite: 'none',
          path: '/',
          secure: true,
        },
      },
      pkceCodeVerifier: {
        name: 'next-auth.pkce.code_verifier',
        options: {
          httpOnly: true,
          sameSite: 'none',
          path: '/',
          secure: true,
        },
      },
    },
  });
};
export { auth as GET, auth as POST };
