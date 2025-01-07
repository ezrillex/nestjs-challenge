import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsResolver } from './products.resolver';

@Module({
  imports: [AuthModule],
  providers: [ProductsService, PrismaService, ProductsResolver],
  exports: [ProductsService],
})
export class ProductsModule {}
