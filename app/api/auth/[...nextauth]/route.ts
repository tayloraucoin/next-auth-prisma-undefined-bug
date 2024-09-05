import NextAuth from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';

import bcrypt from 'bcrypt';

import prisma from '@/lib/helpers/prisma';
// import { generateAppleSecret } from '@/lib/helpers/oauth';

const auth = async (req: NextApiRequest, res: NextApiResponse) => {
  await prisma.$connect();

  // const appleSecret = await generateAppleSecret();

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
      // AppleProvider({
      //   clientId: process.env.APPLE_CLIENT_ID ?? '',
      //   clientSecret: appleSecret ?? '',
      // }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
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

          // check to see if user exists
          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: credentials.email,
                mode: 'insensitive',
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
    secret: process.env.NEXT_AUTH_SECRET,
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user, account, profile }) {
        console.warn('JWT callback triggered');
        console.warn('Initial token:', JSON.stringify(token, null, 2));
        console.warn(
          'JWT callback props',
          JSON.stringify({
            token,
            user,
            account,
            profile,
          }),
        );
        if (user) {
          token.id = user.id;
          token.email = user.email;
          console.warn(
            'User found, token updated with user details:',
            JSON.stringify(token, null, 2),
          );
        }
        return token;
      },

      async session({ session, token, user }) {
        console.warn('Session callback triggered');
        console.warn(
          'Session object before modification:',
          JSON.stringify(session, null, 2),
        );
        console.warn('Token object:', JSON.stringify(token, null, 2));
        console.warn(
          'JWT callback props',
          JSON.stringify({
            session,
            token,
            user,
          }),
        );

        session.user = token as any;

        console.warn(
          'Session object after modification:',
          JSON.stringify(session, null, 2),
        );
        return session;
      },

      async redirect({ url, baseUrl }) {
        console.warn('Redirect callback - url:', url, 'baseUrl:', baseUrl);
        return url.startsWith('/') ? `${baseUrl}${url}` : url;
      },

      async signIn({ user, account, profile, email, credentials }) {
        console.warn('signIn callback triggered');
        console.warn('User:', JSON.stringify(user, null, 2));
        console.warn('Account:', JSON.stringify(account, null, 2));
        console.warn('Profile:', JSON.stringify(profile, null, 2));
        console.warn('Email:', JSON.stringify(email, null, 2));
        console.warn('Credentials:', JSON.stringify(credentials, null, 2));
        return true;
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
