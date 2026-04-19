import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { DB_URL } from 'prisma.config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const pool = new Pool({ connectionString: DB_URL });

    const adapter = new PrismaPg(pool);
    const options: Prisma.PrismaClientOptions = {
      log: ['query', 'info', 'warn', 'error'],
      adapter,
    };
    super(options);
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
