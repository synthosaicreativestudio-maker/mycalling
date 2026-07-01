import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const authLink = await prisma.authLink.findUnique({
      where: { code }
    });

    if (!authLink) {
      return NextResponse.json({ status: 'EXPIRED' });
    }

    if (authLink.expiresAt < new Date()) {
      if (authLink.status === 'PENDING') {
        await prisma.authLink.update({
          where: { id: authLink.id },
          data: { status: 'EXPIRED' }
        });
      }
      return NextResponse.json({ status: 'EXPIRED' });
    }

    if (authLink.status === 'COMPLETED') {
      return NextResponse.json({
        status: 'COMPLETED',
        sessionToken: authLink.sessionToken
      });
    }

    return NextResponse.json({ status: 'PENDING' });
  } catch (error: any) {
    console.error('Error polling link code:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
