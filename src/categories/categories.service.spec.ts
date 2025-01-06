import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { Categories } from '@prisma/client';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, CategoriesService],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Should be defined', async () => {
    expect(service.CreateCategory).toBeDefined();
  });

  it('Should be defined', async () => {
    expect(service.DeleteCategory).toBeDefined();
  });

  describe('add categories tests', () => {
    it('should throw if category name already exists', async () => {
      jest.spyOn(prismaService.categories, 'count').mockResolvedValue(1);

      await expect(
        service.CreateCategory('some name that definitely is not duped'),
      ).rejects.toThrowErrorMatchingSnapshot('category already exists error');
    });

    it('should create a category ', async () => {
      let created = false;
      jest.spyOn(prismaService.categories, 'count').mockResolvedValue(0);
      jest.spyOn(prismaService.categories, 'create').mockImplementation(() => {
        created = true;
        return null;
      });
      await service.CreateCategory('some name that definitely is not duped');
      expect(created).toEqual(true);
    });
  });

  describe('delete categories tests', () => {
    it('should throw if category name already exists', async () => {
      await expect(
        service.DeleteCategory('2730fc05-6f87-49e5-8a41-559208048ebe'),
      ).rejects.toThrowErrorMatchingSnapshot('category does not exist');
    });

    it('should return a specific message when successful ', async () => {
      jest.spyOn(prismaService.categories, 'count').mockResolvedValue(1);
      jest.spyOn(prismaService.categories, 'delete').mockResolvedValue({
        id: '2730fc05-6f87-49e5-8a41-559208048ebe',
      } as Categories);
      await expect(
        service.DeleteCategory('2730fc05-6f87-49e5-8a41-559208048ebe'),
      ).resolves.toEqual('Record Deleted');
    });

    it('should throw if nothing is returned from prisma', async () => {
      jest.spyOn(prismaService.categories, 'count').mockResolvedValue(1);
      jest.spyOn(prismaService.categories, 'delete').mockResolvedValue(null);
      await expect(
        service.DeleteCategory('2730fc05-6f87-49e5-8a41-559208048ebe'),
      ).rejects.toThrowErrorMatchingSnapshot('error when deleting');
    });
  });
});
