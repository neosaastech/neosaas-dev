import { auth0 } from '@/lib/auth0';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Verify Auth0 session
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 2. Generate internal JWT
    const internalToken = jwt.sign(
      {
        userId: session.user.sub,
        email: session.user.email,
        name: session.user.name,
        roles: session.user.roles || ['user'],
      },
      process.env.INTERNAL_JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // 3. Return internal JWT
    return NextResponse.json({ internalToken });
  } catch (error) {
    console.error('Error generating internal JWT:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
