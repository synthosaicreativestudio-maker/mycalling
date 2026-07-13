import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId, coachSessionId } = await req.json().catch(() => ({}));
    let finalUserId = userId;

    if (!finalUserId && coachSessionId) {
      const coachSession = await prisma.coachSession.findUnique({
        where: { id: coachSessionId }
      });
      if (coachSession) {
        finalUserId = coachSession.userId;
      }
    }

    const randomHex = crypto.randomBytes(8).toString('hex');
    const code = `auth_${randomHex}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    const authLink = await prisma.authLink.create({
      data: {
        code,
        status: 'PENDING',
        userId: finalUserId || null,
        expiresAt
      }
    });

    console.log('[auth] Generated link code:', {
      code: authLink.code,
      userId: authLink.userId,
      expiresAt: authLink.expiresAt
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
