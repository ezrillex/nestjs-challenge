import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('LikesService', () => {
  let service: LikesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, LikesService],
    }).compile();

    service = module.get<LikesService>(LikesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have method Like a Product Variation', () => {
    expect(service.LikeProduct).toBeDefined();
  });

  it('should have method Remove Like of a Product Variation', () => {
    expect(service.RemoveLike).toBeDefined();
  });

  it('should have method Get Likes of User', () => {
    expect(service.GetLikes).toBeDefined();
  });

  describe('Like a Product Tests', () => {
    it('Should error if nonexistent uuid of product variation is passed.', async () => {
      await expect(
        service.LikeProduct(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot(
        'like non existing product variation id',
      );
    });

    it('Should error if product variation was already liked by user', async () => {
      const mock_product = {
        id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        title: 'mock product',
        price: new Decimal(12),
        stock: 94,
        product_id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        last_updated_by: '2730fc05-6f87-49e5-8a41-559208048ebe',
        last_updated_at: new Date(),
      };
      jest
        .spyOn(prismaService.productVariations, 'findUnique')
        .mockResolvedValue(mock_product);

      const mock_likes = {
        id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        user_id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        product_variation_id: '2730fc05-6f87-49e5-8a41-559208048ebe',
      };
      jest
        .spyOn(prismaService.likesOfProducts, 'findFirst')
        .mockResolvedValue(mock_likes);

      await expect(
        service.LikeProduct(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('user already liked product');
    });

    it('Should return created like if all is valid', async () => {
      const mock_product = {
        id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        title: 'mock product',
        price: new Decimal(12),
        stock: 94,
        product_id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        last_updated_by: '2730fc05-6f87-49e5-8a41-559208048ebe',
        last_updated_at: new Date(),
      };
      jest
        .spyOn(prismaService.productVariations, 'findUnique')
        .mockResolvedValue(mock_product);

      const mock_likes = null;
      jest
        .spyOn(prismaService.likesOfProducts, 'findFirst')
        .mockResolvedValue(mock_likes);

      const mock_creation = {
        id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        user_id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        product_variation_id: '2730fc05-6f87-49e5-8a41-559208048ebe',
      };
      jest
        .spyOn(prismaService.likesOfProducts, 'create')
        .mockResolvedValue(mock_creation);

      await expect(
        service.LikeProduct(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).resolves.toBe(mock_creation);
    });
  });
});
