import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';
import { UpdateProductInput } from './inputs/update-product.input';

describe('LikesService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create product should be defined', () => {
    expect(service.CreateProduct).toBeDefined();
  });

  it('update product should be defined', () => {
    expect(service.UpdateProduct).toBeDefined();
  });

  it('get products should be defined', () => {
    expect(service.GetProducts).toBeDefined();
  });

  it('get products by id should be defined', () => {
    expect(service.GetProductById).toBeDefined();
  });

  it('get products variation should be defined', () => {
    expect(service.GetProductVariationById).toBeDefined();
  });

  it('update products variation should be defined', () => {
    expect(service.UpdateProductVariation).toBeDefined();
  });

  it('create product variation should be defined', () => {
    expect(service.CreateProductVariation).toBeDefined();
  });

  it('delete product variation should be defined', () => {
    expect(service.DeleteProductVariation).toBeDefined();
  });

  it('delete product should be defined', () => {
    expect(service.DeleteProduct).toBeDefined();
  });

  describe('create product', () => {
    it('passes data to prisma query correctly', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2020, 12, 12, 12, 12));
      const spy = jest
        .spyOn(prismaService.products, 'create')
        .mockResolvedValue(null);

      await service.CreateProduct(
        {
          name: 'test name',
          description: 'test description',
          categories: ['076b5b00-c719-40c3-a8f2-d1a11c17b75c'],
          variations: [
            { title: 'test var 1', stock: 123, price: 321.11 },
            { title: 'test var 2', stock: 321, price: 321.22 },
          ],
        },
        '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
      );

      expect(spy.mock.calls).toMatchSnapshot('create product query');
    });
  });

  describe('update product', () => {
    it('throws if product is not found', async () => {
      await expect(
        service.UpdateProduct(
          { id: '076b5b00-c719-40c3-a8f2-d1a11c17b75c' } as UpdateProductInput,
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('not found error product');
    });

    it('throws if no values to update are provided', async () => {
      jest.spyOn(prismaService.products, 'count').mockResolvedValue(1);

      await expect(
        service.UpdateProduct(
          { id: '076b5b00-c719-40c3-a8f2-d1a11c17b75c' } as UpdateProductInput,
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('one is required to update');
    });

    it('passes values to the update query', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2020, 12, 12, 12, 12));
      jest.spyOn(prismaService.products, 'count').mockResolvedValue(1);
      const spy = jest
        .spyOn(prismaService.products, 'update')
        .mockResolvedValue(null);

      await expect(
        service.UpdateProduct(
          {
            id: '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
            name: 'test name',
            is_published: false,
            description: 'test description',
            categories: ['test category id'],
          },
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
        ),
      ).resolves.not.toThrow();

      expect(spy.mock.calls).toMatchSnapshot('prisma query products update');
    });
  });
});
