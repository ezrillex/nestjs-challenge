import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OrderItemsResolver } from './order-items/order-items.resolver';
import { ProductsService } from '../products/products.service';
import { StripeService } from '../payments/stripe.service';

@Module({
  providers: [
    OrdersService,
    OrdersResolver,
    PrismaService,
    UsersService,
    OrderItemsResolver,
    ProductsService,
    StripeService,
  ],
})
export class OrdersModule {}
