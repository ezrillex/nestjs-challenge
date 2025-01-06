import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';
import { UpdateProductInput } from './inputs/update-product.input';
import { Products, ProductVariations, roles } from '@prisma/client';
import { UpdateProductVariationInput } from './product_variation/update-product-variation.input';
import { CreateProductVariationInput } from './product_variation/create_product_variation.input';

describe('Products Service', () => {
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
            is_published: true,
            description: 'test description',
            categories: ['test category id'],
          },
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
        ),
      ).resolves.not.toThrow();

      expect(spy.mock.calls).toMatchSnapshot('prisma query products update');
    });
  });

  describe('Get products', () => {
    it('passes data to prisma query with defaults.', async () => {
      const spy = jest
        .spyOn(prismaService.products, 'findMany')
        .mockResolvedValue(null);

      await service.GetProducts(roles.customer, {
        categoryFilter: [],
        search: '',
        first: 0,
        likedOnly: false,
        offset: 0,
        sort: '',
        omitImages: false,
      });

      expect(spy.mock.calls).toMatchSnapshot(
        'minimal parameters, default pagination query',
      );
    });

    it('passes data to prisma query including unpublished if manager.', async () => {
      const spy = jest
        .spyOn(prismaService.products, 'findMany')
        .mockResolvedValue(null);

      await service.GetProducts(roles.manager, {
        categoryFilter: [],
        search: '',
        first: 0,
        likedOnly: false,
        offset: 0,
        sort: '',
        omitImages: false,
      });

      expect(spy.mock.calls).toMatchSnapshot(
        'query manager unpublished included',
      );
    });

    it('passes data to prisma query including search query.', async () => {
      const spy = jest
        .spyOn(prismaService.products, 'findMany')
        .mockResolvedValue(null);

      await service.GetProducts(roles.manager, {
        categoryFilter: [],
        search: 'test search',
        first: 0,
        likedOnly: false,
        offset: 0,
        sort: '',
        omitImages: false,
      });

      expect(spy.mock.calls).toMatchSnapshot('query search included');
    });

    it('passes data to prisma query including category query.', async () => {
      const spy = jest
        .spyOn(prismaService.products, 'findMany')
        .mockResolvedValue(null);

      await service.GetProducts(roles.manager, {
        categoryFilter: ['id 1', 'id 2'],
        search: 'test search',
        first: 0,
        likedOnly: false,
        offset: 0,
        sort: '',
        omitImages: false,
      });

      expect(spy.mock.calls).toMatchSnapshot('query category included');
    });

    it('passes data to prisma query including custom pagination query.', async () => {
      const spy = jest
        .spyOn(prismaService.products, 'findMany')
        .mockResolvedValue(null);

      await service.GetProducts(roles.manager, {
        categoryFilter: ['id 1', 'id 2'],
        search: 'test search',
        first: 10,
        likedOnly: false,
        offset: 20,
        sort: '',
        omitImages: false,
      });

      expect(spy.mock.calls).toMatchSnapshot('query paginatin custom included');
    });
  });

  describe('Get one product by id', () => {
    it('passes data to prisma query role manager.', async () => {
      const spy = jest
        .spyOn(prismaService.products, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.GetProductById(
          roles.manager,
          '5c0532dc-2174-46f5-b97e-b4b297e9e699',
        ),
      ).rejects.toThrow();

      expect(spy.mock.calls).toMatchSnapshot('query includes unpublished');
    });

    it('passes data to prisma query role customer.', async () => {
      const spy = jest
        .spyOn(prismaService.products, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.GetProductById(
          roles.customer,
          '5c0532dc-2174-46f5-b97e-b4b297e9e699',
        ),
      ).rejects.toThrow();

      expect(spy.mock.calls).toMatchSnapshot('query omits unpublished');
    });

    it('throws if not found', async () => {
      jest.spyOn(prismaService.products, 'findUnique').mockReset();
      await expect(
        service.GetProductById(
          roles.manager,
          '5c0532dc-2174-46f5-b97e-b4b297e9e699',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('not found error');
    });

    it('returns if all ok', async () => {
      jest
        .spyOn(prismaService.products, 'findUnique')
        .mockResolvedValue({ id: 'testing' } as Products);

      await expect(
        service.GetProductById(roles.customer, 'test id'),
      ).resolves.toMatchSnapshot('all ok get one prod by id');
    });
  });

  describe('Get product variation by id', () => {
    it('count 0 if not found and count mode on', async () => {
      await expect(
        service.GetProductVariationById(
          '5c0532dc-2174-46f5-b97e-b4b297e9e699',
          true,
        ),
      ).resolves.toEqual(0);
    });

    it('throws if not found and count mode off', async () => {
      jest.spyOn(prismaService.productVariations, 'findUnique').mockReset();

      await expect(
        service.GetProductVariationById('5c0532dc-2174-46f5-b97e-b4b297e9e699'),
      ).rejects.toThrow();
    });

    it('passes a query to prisma find fn', async () => {
      const spy = jest
        .spyOn(prismaService.productVariations, 'findUnique')
        .mockResolvedValue({ id: 'testing' } as ProductVariations);

      await service.GetProductVariationById(
        '5c0532dc-2174-46f5-b97e-b4b297e9e699',
      );

      expect(spy.mock.calls).toMatchSnapshot('query find prod var');
    });
  });

  describe('Update product variation', () => {
    it('throws if not found', async () => {
      await expect(
        service.UpdateProductVariation(
          {
            id: '5c0532dc-2174-46f5-b97e-b4b297e9e699',
          } as UpdateProductVariationInput,
          '5c0532dc-2174-46f5-b97e-b4b297e9e699',
        ),
      ).rejects.toThrowErrorMatchingSnapshot(
        'not found error update product variation',
      );
    });
    it('throws if no arguments to update are passed', async () => {
      jest.spyOn(prismaService.productVariations, 'count').mockResolvedValue(1);
      await expect(
        service.UpdateProductVariation(
          {
            id: '5c0532dc-2174-46f5-b97e-b4b297e9e699',
          } as UpdateProductVariationInput,
          '5c0532dc-2174-46f5-b97e-b4b297e9e699',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('no arguments to update');
    });
    it('passes the data into the prisma query', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2020, 12, 12, 12, 12, 12));
      jest.spyOn(prismaService.productVariations, 'count').mockResolvedValue(1);
      const spy = jest
        .spyOn(prismaService.productVariations, 'update')
        .mockResolvedValue(null);
      await expect(
        service.UpdateProductVariation(
          {
            id: '5c0532dc-2174-46f5-b97e-b4b297e9e699',
            price: 30.45,
            title: 'test title',
            stock: 9000,
          } as UpdateProductVariationInput,
          '5c0532dc-2174-46f5-b97e-b4b297e9e699',
        ),
      ).resolves.toEqual(null);

      expect(spy.mock.calls).toMatchSnapshot('data in the query');
    });
  });

  describe('create product variation', () => {
    it('throws if not found', async () => {
      await expect(
        service.CreateProductVariation(
          {
            product_id: '5c0532dc-2174-46f5-b97e-b4b297e9e699',
          } as CreateProductVariationInput,
          '5c0532dc-2174-46f5-b97e-b4b297e9e699',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('not found product');
    });

    it('passes a query to create with data of input', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2020, 12, 12, 12, 12));
      const spy = jest
        .spyOn(prismaService.productVariations, 'create')
        .mockResolvedValue(null);

      jest.spyOn(prismaService.products, 'count').mockResolvedValue(1);

      await expect(
        service.CreateProductVariation(
          {
            product_id: '5c0532dc-2174-46f5-b97e-b4b297e9e699',
            stock: 58,
            price: 88,
            title: 'test title',
          } as CreateProductVariationInput,
          '5c0532dc-2174-46f5-b97e-b4b297e9e699',
        ),
      ).resolves.toEqual(null);
      expect(spy.mock.calls).toMatchSnapshot(
        'data passed to query create product',
      );
    });
  });

  describe('delete product variation', () => {
    it('throws if not found', async () => {
      jest.spyOn(prismaService.productVariations, 'findUnique').mockReset();
      await expect(
        service.DeleteProductVariation('3d13dcec-6894-4de0-b980-688b897ad7ac'),
      ).rejects.toThrowErrorMatchingSnapshot('not found product variation');
    });

    it('throws if variation is the last one', async () => {
      jest
        .spyOn(prismaService.productVariations, 'findUnique')
        .mockResolvedValue({
          product_id: '3d13dcec-6894-4de0-b980-688b897ad7ac',
        } as ProductVariations);
      jest.spyOn(prismaService.productVariations, 'count').mockResolvedValue(1);

      await expect(
        service.DeleteProductVariation('3d13dcec-6894-4de0-b980-688b897ad7ac'),
      ).rejects.toThrowErrorMatchingSnapshot('cant delete last one');
    });

    it('throws if deletion failed', async () => {
      jest
        .spyOn(prismaService.productVariations, 'findUnique')
        .mockResolvedValue({
          product_id: '3d13dcec-6894-4de0-b980-688b897ad7ac',
        } as ProductVariations);
      jest.spyOn(prismaService.productVariations, 'count').mockResolvedValue(2);

      jest
        .spyOn(prismaService.productVariations, 'delete')
        .mockResolvedValue(null);

      await expect(
        service.DeleteProductVariation('3d13dcec-6894-4de0-b980-688b897ad7ac'),
      ).rejects.toThrowErrorMatchingSnapshot('error when deleting no result');
    });

    it('sends the data to query a delete to prisma', async () => {
      jest
        .spyOn(prismaService.productVariations, 'findUnique')
        .mockResolvedValue({
          product_id: '3d13dcec-6894-4de0-b980-688b897ad7ac',
        } as ProductVariations);
      jest.spyOn(prismaService.productVariations, 'count').mockResolvedValue(2);

      const spy = jest
        .spyOn(prismaService.productVariations, 'delete')
        .mockResolvedValue({
          id: '3d13dcec-6894-4de0-b980-688b897ad7ac',
        } as ProductVariations);

      await expect(
        service.DeleteProductVariation('3d13dcec-6894-4de0-b980-688b897ad7ac'),
      ).resolves.toEqual('Product Variation deleted.');
      expect(spy.mock.calls).toMatchSnapshot('deletion query ok');
    });
  });

  describe('delete product', () => {
    it('throws if not found', async () => {
      await expect(
        service.DeleteProduct(
          '3d13dcec-6894-4de0-b980-688b897ad7ac',
          '3d13dcec-6894-4de0-b980-688b897ad7ac',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('not found product error');
    });

    it('updates is deleted field and update fields', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2020, 12, 12, 12, 12, 12));
      jest.spyOn(prismaService.products, 'count').mockResolvedValue(1);

      const spy = jest
        .spyOn(prismaService.products, 'update')
        .mockResolvedValue(null);
      await expect(
        service.DeleteProduct(
          '3d13dcec-6894-4de0-b980-688b897ad7ac',
          '3d13dcec-6894-4de0-b980-688b897ad7ac',
        ),
      ).resolves.toEqual(null);
      expect(spy.mock.calls).toMatchSnapshot('query update delete flags');
    });
  });
});
