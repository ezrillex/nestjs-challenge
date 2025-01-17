import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariationResolver } from './product_variation.resolver';
import { ProductsService } from '../products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ImagesService } from '../../images/images.service';
import { ConfigService } from '@nestjs/config';

describe('ProductVariationResolver', () => {
  let resolver: ProductVariationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariationResolver,
        ProductsService,
        PrismaService,
        ImagesService,
        ConfigService,
      ],
    }).compile();

    resolver = module.get<ProductVariationResolver>(ProductVariationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
