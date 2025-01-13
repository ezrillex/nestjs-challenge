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

  it('LikesService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('PrismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('toggleLike should be defined', () => {
    expect(service.toggleLike).toBeDefined();
  });

  it('getLikes should be defined', () => {
    expect(service.getLikes).toBeDefined();
  });

  describe('toggleLike', () => {
    it('should throw an error for invalid product variation to like', async () => {
      const spy = jest.spyOn(prismaService.productVariations, 'count');
      await expect(
        service.toggleLike(
          'c0177e32-5584-4518-bbe8-5a648fa33f85',
          'c0177e32-5584-4518-bbe8-5a648fa33f85',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('prod var not found');
      expect(spy.mock.calls).toMatchSnapshot(
        'like query w/delete publish filters',
      );
    });
    it('should delete the existing like record from the database', async () => {
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
        service.toggleLike(
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
    it('should create a new like record in the database', async () => {
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
        service.toggleLike(
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

  describe('getLikes', () => {
    it('should query prisma to get the likes', async () => {
      const spy = jest.spyOn(prismaService.likesOfProducts, 'findMany');

      await expect(
        service.getLikes('8b3ae683-0626-44be-b591-9271e288388f'),
      ).resolves.toEqual([]);
      expect(spy.mock.calls).toMatchSnapshot('prisma query get likes');
    });
  });
});
