import { Test, TestingModule } from '@nestjs/testing';
import { CartItemsResolver } from './cart_items.resolver';

describe('CartItemsResolver', () => {
  let resolver: CartItemsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartItemsResolver],
    }).compile();

    resolver = module.get<CartItemsResolver>(CartItemsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
