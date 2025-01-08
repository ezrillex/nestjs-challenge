import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemsResolver } from './order-items.resolver';

describe('OrderItemsResolver', () => {
  let resolver: OrderItemsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderItemsResolver],
    }).compile();

    resolver = module.get<OrderItemsResolver>(OrderItemsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
