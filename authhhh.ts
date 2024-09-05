import NextAuth from 'next-auth';
import 'next-auth/jwt';

import Google from 'next-auth/providers/google';
import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import vercelKVDriver from 'unstorage/drivers/vercel-kv';
import { UnstorageAdapter } from '@auth/unstorage-adapter';
import type { NextAuthConfig } from 'next-auth';

const storage = createStorage({
  driver: process.env.VERCEL
    ? vercelKVDriver({
        url: process.env.AUTH_KV_REST_API_URL,
        token: process.env.AUTH_KV_REST_API_TOKEN,
        env: false,
      })
    : memoryDriver(),
});

const config = {
  theme: { logo: 'https://authjs.dev/img/logo-sm.png' },
  adapter: UnstorageAdapter(storage),
  providers: [
    // Apple,
    // Auth0,
    // AzureB2C({
    //   clientId: process.env.AUTH_AZURE_AD_B2C_ID,
    //   clientSecret: process.env.AUTH_AZURE_AD_B2C_SECRET,
    //   issuer: process.env.AUTH_AZURE_AD_B2C_ISSUER,
    // }),
    // BankIDNorway,
    // BoxyHQSAML({
    //   clientId: 'dummy',
    //   clientSecret: 'dummy',
    //   issuer: process.env.AUTH_BOXYHQ_SAML_ISSUER,
    // }),
    // Cognito,
    // Coinbase,
    // Discord,
    // Dropbox,
    // Facebook,
    // GitHub,
    // GitLab,
    Google,
    // Hubspot,
    // Keycloak({ name: 'Keycloak (bob/bob)' }),
    // LinkedIn,
    // Netlify,
    // Okta,
    // Passkey({
    //   formFields: {
    //     email: {
    //       label: 'Username',
    //       required: true,
    //       autocomplete: 'username webauthn',
    //     },
    //   },
    // }),
    // Passage,
    // Pinterest,
    // Reddit,
    // Slack,
    // Spotify,
    // Twitch,
    // Twitter,
    // WorkOS({
    //   connection: process.env.AUTH_WORKOS_CONNECTION!,
    // }),
    // Zoom,
  ],
  basePath: '/auth',
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname === '/middleware-example') return !!auth;
      return true;
    },
    jwt({ token, trigger, session, account }) {
      if (trigger === 'update') token.name = session.user.name;
      if (account?.provider === 'keycloak') {
        return { ...token, accessToken: account.access_token };
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  experimental: {
    enableWebAuthn: true,
  },
  debug: process.env.NODE_ENV !== 'production' ? true : false,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}
