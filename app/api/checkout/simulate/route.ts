import { NextResponse } from 'next/server';
import prisma from '@/lib/helpers/prisma';
import { encode } from 'next-auth/jwt';

const JWT_SECRET = process.env.AUTH_SECRET || '';
const SALT = process.env.AUTH_SALT || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { purchaserEmail, purchaserFirstName, purchaserLastName } = body;

    if (!purchaserEmail || !purchaserFirstName || !purchaserLastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Find or create the user
    let ownerUser = await prisma.user.findUnique({
      where: { email: purchaserEmail },
    });

    if (!ownerUser) {
      ownerUser = await prisma.user.create({
        data: {
          email: purchaserEmail,
          firstName: purchaserFirstName,
          lastName: purchaserLastName,
        },
      });
    }

    // Generate a token for the user
    const token = await encode({
      token: { id: ownerUser.id, email: ownerUser.email },
      secret: JWT_SECRET,
      salt: SALT,
      maxAge: 60 * 60, // 1 hour expiration
    });

    // Return the URL with the token
    const url = `/sign-up?token=${token}`;
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error occurred:', error?.message, error?.stack);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
