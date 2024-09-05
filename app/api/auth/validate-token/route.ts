export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { encode, decode } from 'next-auth/jwt';
import { JWT } from 'next-auth/jwt';

const JWT_SECRET = process.env.NEXT_AUTH_SECRET || '';
const SALT = process.env.NEXT_AUTH_SALT || '';

export async function GET(req: Request) {
  try {
    console.log('START: Processing GET request');

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    console.log('Received token:', token);

    if (!token) {
      console.error('No token provided');
      return NextResponse.json({ message: 'Invalid Token' }, { status: 400 });
    }

    // Use NextAuth's `decode` method to validate and decode the token
    let decodedToken;
    try {
      decodedToken = await decode({ token, salt: SALT, secret: JWT_SECRET });
    } catch (decodeError) {
      console.error('Decode error:', decodeError);
      return NextResponse.json(
        { message: 'Failed to decode token', error: decodeError },
        { status: 401 },
      );
    }

    console.log('Decoded token:', decodedToken);

    if (!decodedToken) {
      console.error('Decoded token is null or undefined');
      return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
    }

    // Use NextAuth's `encode` method to create a new JWT in the expected format
    let nextAuthToken;
    try {
      nextAuthToken = await encode({
        token: decodedToken as JWT,
        secret: JWT_SECRET,
        salt: SALT,
      });
    } catch (encodeError) {
      console.error('Encode error:', encodeError);
      return NextResponse.json(
        { message: 'Failed to encode token', error: encodeError },
        { status: 500 },
      );
    }

    console.log('New JWT created:', nextAuthToken);

    const response = NextResponse.json(
      { valid: true, data: decodedToken },
      { status: 200 },
    );

    // Set the JWT in the session cookie using NextAuth's format
    response.cookies.set('next-auth.session-token', nextAuthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      // have tried all sameSite options
      // sameSite: 'lax',
      // sameSite: 'strict',
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    console.log(
      'Session cookie set:',
      response.cookies.get('next-auth.session-token'),
    );

    return response;
  } catch (error) {
    console.error('Unexpected error occurred:', error);
    return NextResponse.json(
      { valid: false, message: 'Token is invalid or expired' },
      { status: 401 },
    );
  }
}
