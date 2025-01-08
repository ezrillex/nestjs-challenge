import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CartItems,
  roles,
  ProductVariations,
  Orders,
  Prisma,
} from '@prisma/client';
import { ProductsService } from '../products/products.service';

describe('Orders Service', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, OrdersService, ProductsService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have method CreateOrder', () => {
    expect(service.CreateOrder).toBeDefined();
  });

  it('should have method GetOrders', () => {
    expect(service.GetOrders).toBeDefined();
  });

  it('should have method GetOrder', () => {
    expect(service.GetOrder).toBeDefined();
  });

  describe('Get Orders', () => {
    it('should query the user id if role customer', async () => {
      let data;
      jest
        .spyOn(prismaService.orders, 'findMany')
        .mockImplementation((query) => {
          data = query;
          return null;
        });

      await expect(
        service.GetOrders('the_user_id', roles.customer),
      ).resolves.not.toThrow();

      expect(data).toMatchSnapshot('role customer result');
    });

    it('should query the client id if role manager', async () => {
      let data;
      jest
        .spyOn(prismaService.orders, 'findMany')
        .mockImplementation((query) => {
          data = query;
          return null;
        });

      await service.GetOrders('the_user_id', roles.manager, 'client_id');

      expect(data).toMatchSnapshot('role manager result');
    });

    it('should throw if the client id is null and  if role manager', async () => {
      jest.spyOn(prismaService.orders, 'findMany').mockImplementation(() => {
        return null;
      });

      await expect(
        service.GetOrders('the_user_id', roles.manager),
      ).rejects.toThrowErrorMatchingSnapshot('client id is null');
    });
  });

  describe('Get One Order', () => {
    it('should include order id and client in query', async () => {
      let data;
      jest
        .spyOn(prismaService.orders, 'findUnique')
        .mockImplementation((query) => {
          data = query;
          return null;
        });

      await service.GetOrder('testing_user_id', 'testing_client_id');

      expect(data).toMatchSnapshot('get one order result');
    });
  });

  describe('Create an order', () => {
    it('should throw if no cart items', async () => {
      jest.spyOn(prismaService.cartItems, 'findMany').mockResolvedValue([]);

      await expect(
        service.CreateOrder('testing_user_id'),
      ).rejects.toThrowErrorMatchingSnapshot('error no items in the cart');
    });

    it('should unroll nested product info and send a valid query', async () => {
      type QueryType = CartItems & {
        product_variation: ProductVariations;
      };

      jest.spyOn(prismaService.cartItems, 'findMany').mockResolvedValue([
        {
          quantity: 1,
          product_variation_id: 'prod var 1',
          product_variation: {
            id: 'some id',
            title: 'test title',
            price: 34,
            stock: 5,
            product_id: 'some product id',
            last_updated_by: 'some user id',
            last_updated_at: new Date(),
          },
        },
        {
          quantity: 4,
          product_variation_id: 'prod var 2',
          product_variation: {
            id: 'some id 2',
            title: 'test title2',
            price: 343,
            stock: 53,
            product_id: 'some product id2',
            last_updated_by: 'some user id2',
            last_updated_at: new Date(),
          },
        },
      ] as unknown as QueryType[]);

      let result;
      jest.spyOn(prismaService.orders, 'create').mockImplementation((input) => {
        result = input;
        return null;
      });
      await expect(
        service.CreateOrder('testing_user_id'),
      ).rejects.toThrowErrorMatchingSnapshot(
        'error ocurred when creating order',
      );
      expect(result).toMatchSnapshot('query of order creation test');
    });

    it('should unroll cart ids and send a valid query', async () => {
      type QueryType = CartItems & {
        product_variation: ProductVariations;
      };

      jest.spyOn(prismaService.cartItems, 'findMany').mockResolvedValue([
        {
          id: 'some id',
          quantity: 1,
          product_variation_id: 'prod var 1',
          product_variation: {
            title: 'test title',
            price: 34,
            stock: 5,
            product_id: 'some product id',
            last_updated_by: 'some user id',
            last_updated_at: new Date(),
          },
        },
        {
          id: 'some id 2',
          quantity: 4,
          product_variation_id: 'prod var 2',
          product_variation: {
            title: 'test title2',
            price: 343,
            stock: 53,
            product_id: 'some product id2',
            last_updated_by: 'some user id2',
            last_updated_at: new Date(),
          },
        },
      ] as unknown as QueryType[]);

      jest.spyOn(prismaService.orders, 'create').mockResolvedValue({
        id: '1',
      } as unknown as Prisma.Prisma__OrdersClient<Orders>);

      const spy = jest
        .spyOn(prismaService.cartItems, 'deleteMany')
        .mockResolvedValue({
          count: 1,
        });

      const returned = await service.CreateOrder('testing_user_id');

      const input = spy.mock.calls[0];

      expect(input).toMatchSnapshot('query of delete many test');
      expect(returned).toMatchSnapshot('create order return');
    });
    it('throws error if delete count is 0, error', async () => {
      type QueryType = CartItems & {
        product_variation: ProductVariations;
      };

      jest.spyOn(prismaService.cartItems, 'findMany').mockResolvedValue([
        {
          id: 'some id',
          quantity: 1,
          product_variation_id: 'prod var 1',
          product_variation: {
            title: 'test title',
            price: 34,
            stock: 5,
            product_id: 'some product id',
            last_updated_by: 'some user id',
            last_updated_at: new Date(),
          },
        },
        {
          id: 'some id 2',
          quantity: 4,
          product_variation_id: 'prod var 2',
          product_variation: {
            title: 'test title2',
            price: 343,
            stock: 53,
            product_id: 'some product id2',
            last_updated_by: 'some user id2',
            last_updated_at: new Date(),
          },
        },
      ] as unknown as QueryType[]);

      jest.spyOn(prismaService.orders, 'create').mockResolvedValue({
        id: '1',
      } as unknown as Prisma.Prisma__OrdersClient<Orders>);

      jest.spyOn(prismaService.cartItems, 'deleteMany').mockResolvedValue({
        count: 0,
      });

      await expect(
        service.CreateOrder('testing_user_id'),
      ).rejects.toThrowErrorMatchingSnapshot('error unexpected when deleting');
    });
  });
});
