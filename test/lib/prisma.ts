import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DB_URL } from '../../prisma.config';

/** Same connection string as Nest `PrismaService` so RBAC helpers mutate the DB the API uses. */
const prisma = new PrismaClient({
  adapter: new PrismaPg(DB_URL),
});

export default prisma;
