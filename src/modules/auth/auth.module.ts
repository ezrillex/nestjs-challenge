import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../../controllers/authentication/auth.controller';
import { AuthService } from '../../services/authentication/auth.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { RolesGuard } from '../../guards/roles/roles.guard';
import { UsersController } from '../../controllers/users/users.controller';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    PrismaService,
    // order matters here.
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
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
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
  ],
})
export class AuthModule {}
