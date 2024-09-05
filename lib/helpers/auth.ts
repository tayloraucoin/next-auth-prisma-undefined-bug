import { encode } from 'next-auth/jwt';

const JWT_SECRET = process.env.NEXT_AUTH_SECRET || '';
const SALT = process.env.NEXT_AUTH_SALT || '';

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
    salt: SALT,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return token;
}

export const validateToken = async (
  token: string,
  setError?: (message: string) => void,
  setLoading?: (loading: boolean) => void,
) => {
  if (token) {
    console.log('Validating token:', token); // Log token validation start

    try {
      const response = await fetch(
        `/api/auth/validate-token?token=${encodeURIComponent(token)}`,
        {
          method: 'GET',
          credentials: 'include', // Ensure cookies are sent and received
        },
      );

      console.log('Received response from server:', response); // Log response

      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      console.log('Validation result:', result); // Log result of validation

      if (result.valid) {
        // Token is valid, proceed with sign-in
        console.log('Token is valid, user ID:', result.data.id);
        return result;
      } else {
        console.log('Invalid or expired token');
        if (setError) setError('Invalid or expired token');
      }
    } catch (err) {
      console.error('Token validation error:', err); // Log validation error
      if (setError) setError('An error occurred while validating the token');
    } finally {
      if (setLoading) {
        console.log('Setting loading state to false'); // Log loading state
        setLoading(false);
      }
    }
  } else {
    console.log('No token provided for validation.'); // Log missing token
  }
};
