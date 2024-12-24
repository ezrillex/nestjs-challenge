import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './services/authentication/auth.service';
import { PrismaService } from './services/prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersController } from './controllers/users/users.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, AuthService, PrismaService],
})
export class AppModule {}
