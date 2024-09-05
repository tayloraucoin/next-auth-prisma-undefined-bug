'use client';

import { signIn } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import SocialSignInButton from './SocialSignInButton';
import useRefreshableSession from '@/lib/hooks/use-refresh-session';
import { validateToken } from '@/lib/helpers/auth';

export default function SignUpForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { refreshSession, session, status } = useRefreshableSession();
  console.log('session', session);
  console.log('status', status);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onClickSignInWithProvider = async (provider: 'google') => {
    setIsLoading(true);

    signIn(provider, {
      callbackUrl: '/test-sign-up',
    });
  };

  useEffect(() => {
    if (token) {
      const execute = async () => {
        console.log('Token detected:', token); // Log token detection

        const validateTokenResponse = await validateToken(
          token,
          setError,
          setIsLoading,
        );

        if (validateTokenResponse?.valid) {
          console.log('Token is valid, refreshing session...'); // Log valid token
          refreshSession();
        } else {
          console.error('Token is invalid or expired'); // Log invalid token
        }
      };
      execute();
    } else {
      console.log('No token found in URL.'); // Log missing token
    }
  }, [token]);

  useEffect(() => {
    if (session?.user?.email) {
      // Remove the token from the URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('token');

      console.log('Updating URL without token...'); // Log URL update
      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  }, [session?.user?.email]);

  return (
    <>
      <div className="flex min-h-full flex-col justify-center">
        <div>
          <div className="mb-3">
            <SocialSignInButton
              isLoading={isLoading}
              onClick={onClickSignInWithProvider}
              provider="google"
            />
          </div>
        </div>
      </div>
    </>
  );
}
