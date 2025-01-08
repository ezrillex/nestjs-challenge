import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsResolver } from './products.resolver';
import { ProductVariationResolver } from './product_variation/product_variation.resolver';

@Module({
  imports: [AuthModule],
  providers: [
    ProductsService,
    PrismaService,
    ProductsResolver,
    ProductVariationResolver,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
