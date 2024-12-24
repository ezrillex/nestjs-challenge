import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './services/authentication/auth.service';
import { PrismaService } from './services/prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersController } from './controllers/users/users.controller';
import { ProductsModule } from './modules/products/products.module';
import { ProductsController } from './controllers/products/products.controller';
import { ProductsService } from './services/products/products.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProductsModule,
  ],
  controllers: [AppController, UsersController, ProductsController],
  providers: [AppService, AuthService, PrismaService, ProductsService],
})
export class AppModule {}
