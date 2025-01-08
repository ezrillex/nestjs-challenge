import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariationResolver } from './product_variation.resolver';

describe('ProductVariationResolver', () => {
  let resolver: ProductVariationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVariationResolver],
    }).compile();

    resolver = module.get<ProductVariationResolver>(ProductVariationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
