import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsResolver } from './products.resolver';
import { ProductVariationResolver } from './product_variation/product_variation.resolver';
import { LikesService } from '../likes/likes.service';
import { ImagesService } from '../images/images.service';
import { CategoriesService } from '../categories/categories.service';

@Module({
  imports: [AuthModule],
  providers: [
    ProductsService,
    PrismaService,
    ProductsResolver,
    ProductVariationResolver,
    LikesService,
    ImagesService,
    CategoriesService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
