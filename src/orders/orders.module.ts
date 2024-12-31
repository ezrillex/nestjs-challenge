import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [OrdersService, OrdersResolver, PrismaService],
})
export class OrdersModule {}
