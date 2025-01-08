import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemsResolver } from './order-items.resolver';
import { ProductsService } from '../../products/products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OrderItemsResolver', () => {
  let resolver: OrderItemsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderItemsResolver, ProductsService, PrismaService],
    }).compile();

    resolver = module.get<OrderItemsResolver>(OrderItemsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
