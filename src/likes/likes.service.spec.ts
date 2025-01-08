import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { LikesOfProducts } from '@prisma/client';

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
      } as LikesOfProducts;
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
      } as LikesOfProducts;
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

  describe('Remove a Product Like Tests', () => {
    it('Should error if a like id is invalid', async () => {
      await expect(
        service.RemoveLike('2730fc05-6f87-49e5-8a41-559208048ebe'),
      ).rejects.toThrowErrorMatchingSnapshot(
        'tried to remove non existing like id',
      );
    });

    it('Should return the deleted like if found and deletion successful', async () => {
      const mock_like_count = 1;
      jest
        .spyOn(prismaService.likesOfProducts, 'count')
        .mockResolvedValue(mock_like_count);

      const mock_delete_result = {
        id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        user_id: '2730fc05-6f87-49e5-8a41-559208048ebe',
        product_variation_id: '2730fc05-6f87-49e5-8a41-559208048ebe',
      } as LikesOfProducts;
      jest
        .spyOn(prismaService.likesOfProducts, 'delete')
        .mockResolvedValue(mock_delete_result);

      await expect(
        service.RemoveLike('2730fc05-6f87-49e5-8a41-559208048ebe'),
      ).resolves.toEqual({
        result: 'Like removed successfully',
        ...mock_delete_result,
      });
    });
  });

  describe('get likes', () => {
    it('should pass a query to prisma', async () => {
      const spy = jest.spyOn(prismaService.likesOfProducts, 'findMany');

      await expect(
        service.GetLikes('8b3ae683-0626-44be-b591-9271e288388f'),
      ).resolves.toEqual([]);
      expect(spy.mock.calls).toMatchSnapshot('prisma query get likes');
    });
  });
});
