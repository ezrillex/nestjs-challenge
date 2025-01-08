import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariationResolver } from './product_variation.resolver';
import { ProductsService } from '../products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProductVariationResolver', () => {
  let resolver: ProductVariationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVariationResolver, ProductsService, PrismaService],
    }).compile();

    resolver = module.get<ProductVariationResolver>(ProductVariationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
