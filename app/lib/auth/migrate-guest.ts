import 'server-only';
import prisma from '../prisma';

export async function migrateGuestToUser(guestUserId: string, targetUserId: string): Promise<boolean> {
  if (!guestUserId || !targetUserId || guestUserId === targetUserId) {
    return false;
  }

  try {
    const guestUser = await prisma.user.findUnique({
      where: { id: guestUserId },
    });

    if (!guestUser) return false;

    // Выполняем объединение всех связанных сущностей в единой атомарной транзакции
    await prisma.$transaction(async (tx) => {
      // 1. Сохраняем ответы на тесты
      if (guestUser.diagnosticAnswers) {
        await tx.user.update({
          where: { id: targetUserId },
          data: {
            diagnosticAnswers: guestUser.diagnosticAnswers,
          },
        });
      }

      // 2. Переносим коуч-сессии (удаляем существующие дефолтные сессии целевого пользователя)
      await tx.coachSession.deleteMany({ where: { userId: targetUserId } });
      await tx.coachSession.updateMany({
        where: { userId: guestUserId },
        data: { userId: targetUserId },
      });

      // 3. Переносим результаты тестов
      await tx.diagnosticResult.updateMany({
        where: { userId: guestUserId },
        data: { userId: targetUserId },
      });

      // 4. Переносим цифровой профиль
      await tx.digitalProfile.deleteMany({ where: { userId: targetUserId } });
      await tx.digitalProfile.updateMany({
        where: { userId: guestUserId },
        data: { userId: targetUserId },
      });

      // 5. Переносим отчёт
      await tx.report.deleteMany({ where: { userId: targetUserId } });
      await tx.report.updateMany({
        where: { userId: guestUserId },
        data: { userId: targetUserId },
      });

      // 6. Помечаем гостя как объединенного (soft merge)
      await tx.user.update({
        where: { id: guestUserId },
        data: { mergedInto: targetUserId },
      });
    });

    console.log(`[auth/migrate-guest] Successful transaction merge ${guestUserId} -> ${targetUserId}`);
    return true;
  } catch (err) {
    console.error(`[auth/migrate-guest] Transaction failed for merge ${guestUserId} -> ${targetUserId}:`, err);
    return false;
  }
}
