import { headers } from 'next/headers';
import { auth } from '../auth';
import prisma from '../prisma';

/**
 * Единая точка определения владельца запроса (principal) на сервере.
 *
 * ПРИНЦИП (docs/audit A1, OWASP A01:2025 Broken Access Control): никогда не
 * доверяем идентификаторам из query/тела как доказательству владения. Владелец
 * определяется ТОЛЬКО из серверной сессии Better Auth, затем ресурсы выбираются
 * из БД с ограничением `where userId = principal`. Идентификаторы клиента могут
 * использоваться лишь как подсказка ПОСЛЕ сверки, но не вместо неё.
 *
 * Возвращает userId вошедшего пользователя (с разрешением soft-merge через
 * mergedInto) или null, если сессии нет.
 */
export async function getPrincipalUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return null;

  // Разрешаем soft-merge: если пользователя слили в другого — работаем с целевым.
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser?.mergedInto) return dbUser.mergedInto;
  return userId;
}
