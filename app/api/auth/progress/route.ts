import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '../../../lib/prisma';
import { auth } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session || !session.user) {
      return NextResponse.json({ authenticated: false });
    }
    
    const userId = session.user.id;

    const coachSession = await prisma.coachSession.findUnique({
      where: { userId }
    });

    const diagnosticResult = await prisma.diagnosticResult.findFirst({
      where: { userId }
    });

    return NextResponse.json({
      authenticated: true,
      coachCompleted: coachSession?.status === 'COMPLETED',
      testCompleted: !!diagnosticResult,
      sessionId: coachSession?.id || null
    });
  } catch (error: any) {
    console.error('Error fetching progress status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
