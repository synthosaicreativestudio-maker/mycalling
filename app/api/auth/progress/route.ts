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
    
    let userId = session.user.id;

    // Проверяем, не был ли этот пользователь объединен с другим (soft merge)
    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (dbUser && dbUser.mergedInto) {
      console.log(`[auth/progress] User ${userId} was merged into ${dbUser.mergedInto}, resolving progress for new user`);
      userId = dbUser.mergedInto;
    }

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
