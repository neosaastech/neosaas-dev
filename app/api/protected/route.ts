import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge Runtime for Vercel

export async function GET(request: Request) {
  try {
    // 1. Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token missing' },
        { status: 401 }
      );
    }

    // 2. Verify internal JWT
    const decoded = jwt.verify(token, process.env.INTERNAL_JWT_SECRET!) as {
      userId: string;
      email: string;
      name: string;
      roles: string[];
    };

    // 3. Return protected data
    return NextResponse.json({
      message: 'Access granted',
      user: decoded,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
