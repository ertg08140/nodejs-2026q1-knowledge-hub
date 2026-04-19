import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'SECRET_KEY',
      // signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
