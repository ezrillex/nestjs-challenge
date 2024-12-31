import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartItemsResolver } from './cart_items.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CartsService, CartItemsResolver, PrismaService],
})
export class CartsModule {}
