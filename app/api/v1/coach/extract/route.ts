import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Недостаточно данных' }, { status: 400 });
    }

    const coachSession = await prisma.coachSession.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!coachSession) {
      return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 });
    }

    const extractedData = (coachSession.extractedData as Record<string, any>) || { currentStep: 0 };
    return NextResponse.json({
      currentStep: extractedData.currentStep || 0,
      extracted: extractedData
    });

  } catch (error: any) {
    console.error('Error in coach extract route:', error);
    return NextResponse.json({ error: error.message || 'Внутренняя ошибка' }, { status: 500 });
  }
}
