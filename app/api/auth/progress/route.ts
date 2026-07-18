import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '../../../lib/prisma';
import { auth } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const reqHeaders = await headers();
    const cookieHeader = reqHeaders.get('cookie') || '';
    const hasBetterAuthCookie = cookieHeader.includes('better-auth.session_token');
    const hasSecureCookie = cookieHeader.includes('__secure-better-auth.session_token');
    
    console.log('[auth/progress] Checking session. Cookies present:', {
      hasBetterAuthCookie,
      hasSecureCookie,
      cookieCount: cookieHeader.split(';').length,
      cookiePreview: cookieHeader.substring(0, 200)
    });

    const session = await auth.api.getSession({
      headers: reqHeaders
    });
    
    console.log('[auth/progress] getSession result:', {
      hasSession: !!session,
      userId: session?.user?.id || null,
      userName: session?.user?.name || null
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

    const extracted = (coachSession?.extractedData as Record<string, any>) || {};

    return NextResponse.json({
      authenticated: true,
      coachCompleted: coachSession?.status === 'COMPLETED',
      testCompleted: !!diagnosticResult,
      sessionId: coachSession?.id || null,
      coachSessionMode: extracted.sessionMode || null,
      deepSessionCompleted: !!extracted.deepSessionCompletedAt
    });
  } catch (error: any) {
    console.error('Error fetching progress status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
