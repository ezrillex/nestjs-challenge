import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { PrismaService } from '../prisma/prisma.service';

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

  it('should have method ToggleLike', () => {
    expect(service.ToggleLike).toBeDefined();
  });

  it('should have method Get Likes of User', () => {
    expect(service.GetLikes).toBeDefined();
  });

  describe('toggle likes', () => {
    it('throws if variation to like is invalid', async () => {
      const spy = jest.spyOn(prismaService.productVariations, 'count');
      await expect(
        service.ToggleLike(
          'c0177e32-5584-4518-bbe8-5a648fa33f85',
          'c0177e32-5584-4518-bbe8-5a648fa33f85',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('prod var not found');
      expect(spy.mock.calls).toMatchSnapshot(
        'like query w/delete publish filters',
      );
    });
    it('if the like exists it should delete the database record', async () => {
      const ids = {
        user_id: 'c0177e32-5584-4518-bbe8-5a648fa33f85',
        product_variation_id: 'c0177e32-5584-4518-bbe8-5a648fa33f85',
      };
      const spy = jest
        .spyOn(prismaService.productVariations, 'count')
        .mockResolvedValue(1);
      const likeSpy = jest
        .spyOn(prismaService.likesOfProducts, 'count')
        .mockResolvedValue(1);
      const deleteResult = {
        id: 'c0177e32-5584-4518-bbe8-5a648fa33f85',
        ...ids,
        created_at: new Date(2020, 12, 12, 12, 12, 12),
      };
      const deleteSpy = jest
        .spyOn(prismaService.likesOfProducts, 'delete')
        .mockResolvedValue(deleteResult);
      await expect(
        service.ToggleLike(
          'c0177e32-5584-4518-bbe8-5a648fa33f85',
          'c0177e32-5584-4518-bbe8-5a648fa33f85',
        ),
      ).resolves.toEqual({
        state: false,
        ...deleteResult,
      });
      expect(spy.mock.calls).toMatchSnapshot(
        'query w/is delete publish filters',
      );
      expect(likeSpy).toHaveBeenCalledWith({
        where: ids,
      });
      expect(deleteSpy).toHaveBeenCalledWith({
        where: {
          user_id_product_variation_id: ids,
        },
      });
    });
    it('if the like does not exist it should create a database record', async () => {
      const ids = {
        user_id: 'c0177e32-5584-4518-bbe8-5a648fa33f85',
        product_variation_id: 'c0177e32-5584-4518-bbe8-5a648fa33f85',
      };
      const spy = jest
        .spyOn(prismaService.productVariations, 'count')
        .mockResolvedValue(1);
      const likeSpy = jest
        .spyOn(prismaService.likesOfProducts, 'count')
        .mockResolvedValue(0);
      const createResult = {
        id: 'c0177e32-5584-4518-bbe8-5a648fa33f85',
        ...ids,
        created_at: new Date(2020, 12, 12, 12, 12, 12),
      };
      const createSpy = jest
        .spyOn(prismaService.likesOfProducts, 'create')
        .mockResolvedValue(createResult);
      await expect(
        service.ToggleLike(
          'c0177e32-5584-4518-bbe8-5a648fa33f85',
          'c0177e32-5584-4518-bbe8-5a648fa33f85',
        ),
      ).resolves.toEqual({
        state: true,
        ...createResult,
      });
      expect(spy.mock.calls).toMatchSnapshot(
        'query w/is delete publish filters',
      );
      expect(likeSpy).toHaveBeenCalledWith({
        where: ids,
      });
      expect(createSpy).toHaveBeenCalledWith({
        data: ids,
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
