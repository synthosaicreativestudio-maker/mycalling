import { PrismaClient } from '@prisma/client';
import { env } from './env';

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
