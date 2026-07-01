import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const randomHex = crypto.randomBytes(8).toString('hex');
    const code = `auth_${randomHex}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    const authLink = await prisma.authLink.create({
      data: {
        code,
        status: 'PENDING',
        expiresAt
      }
    });

    return NextResponse.json({
      code: authLink.code,
      expiresAt: authLink.expiresAt
    });
  } catch (error: any) {
    console.error('Error generating link code:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
