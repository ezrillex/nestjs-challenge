import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../../controllers/authentication/auth.controller';
import { AuthService } from '../../services/authentication/auth.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../guards/auth/auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWTCONSTANT'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}
