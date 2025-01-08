import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartItemsResolver } from './cart_items.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [
    CartsService,
    CartItemsResolver,
    PrismaService,
    ProductsService,
    UsersService,
  ],
})
export class CartsModule {}
