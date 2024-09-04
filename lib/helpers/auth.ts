import { encode, getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

type Props = {
  request: NextRequest;
};
type Response = {
  error: string | null;
  status: number;
  userId: string;
};

const JWT_SECRET = process.env.AUTH_SECRET || '';

export async function generateNextAuthCompatibleToken(
  userId: string,
  email: string,
) {
  const tokenPayload = {
    id: userId,
    email,
  };

  // Use the `encode` function from next-auth/jwt to generate a JWT
  const token = await encode({
    token: tokenPayload,
    secret: JWT_SECRET,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return token;
}

export async function validateRequest({ request }: Props): Promise<Response> {
  const session = await getToken({
    req: request,
    secureCookie: Boolean(process.env.VERCEL_ENV),
  });
  const userId = session?.id as string;

  if (!userId) return { error: 'User ID not found', status: 400, userId };

  return { error: null, status: 200, userId };
}

export const validateToken = async (
  token: string,
  setError?: (message: string) => void,
  setLoading?: (loading: boolean) => void,
) => {
  if (token) {
    try {
      const response = await fetch(
        `/api/auth/validate-token?token=${encodeURIComponent(token)}`,
        {
          method: 'GET',
          credentials: 'include', // Ensure cookies are sent and received
        },
      );

      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.valid) {
        // Token is valid, proceed with sign-in
        console.log('Token is valid, user ID:', result.data.id);
        return result;
      } else {
        console.log('Invalid or expired token');
        if (setError) setError('Invalid or expired token');
      }
    } catch (err) {
      console.error('Token validation error:', err);
      if (setError) setError('An error occurred while validating the token');
    } finally {
      if (setLoading) setLoading(false);
    }
  }
};
