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

describe('OrdersService', () => {
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

  it('PrismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('createOrder should be defined', () => {
    expect(service.createOrder).toBeDefined();
  });

  it('getOrders should be defined', () => {
    expect(service.getOrders).toBeDefined();
  });

  it('getOrder should be defined', () => {
    expect(service.getOrder).toBeDefined();
  });

  it('getOrderItemsByOrder should be defined', () => {
    expect(service.getOrderItemsByOrder).toBeDefined();
  });

  describe('getOrders', () => {
    it('should query orders for the user if the role is customer', async () => {
      let data;
      const spy = jest
        .spyOn(prismaService.orders, 'findMany')
        .mockImplementation((query) => {
          data = query;
          return null;
        });

      await expect(
        service.getOrders('the_user_id', roles.customer, null),
      ).resolves.not.toThrow();

      expect(data).toMatchSnapshot('role customer result');
      expect(spy.mock.calls).toMatchSnapshot(
        'user filtered by itself, w/pagination',
      );
    });

    it('should query all orders with pagination if the role is manager', async () => {
      let data;
      const spy = jest
        .spyOn(prismaService.orders, 'findMany')
        .mockImplementation((query) => {
          data = query;
          return null;
        });

      await service.getOrders('the_user_id', roles.manager, null);

      expect(data).toMatchSnapshot('role manager result');
      expect(spy.mock.calls).toMatchSnapshot('called with manager query');
    });

    it('should query all orders with pagination and filter by client id if role is manager and client id is provided', async () => {
      let data;
      const spy = jest
        .spyOn(prismaService.orders, 'findMany')
        .mockImplementation((query) => {
          data = query;
          return null;
        });

      await service.getOrders('the_user_id', roles.manager, {
        client_id: '2730fc05-6f87-49e5-8a41-559208048ebe',
      });

      expect(data).toMatchSnapshot('role manager result');
      expect(spy.mock.calls).toMatchSnapshot(
        'called with manager query, filter by client id',
      );
    });
  });

  describe('getOrder', () => {
    it('should include order ID and client in the query', async () => {
      let data;
      jest
        .spyOn(prismaService.orders, 'findUnique')
        .mockImplementation((query) => {
          data = query;
          return null;
        });

      await service.getOrder('testing_user_id', 'testing_client_id', null);

      expect(data).toMatchSnapshot('get one order result');
    });
  });

  describe('createOrder', () => {
    it('should throw an error if there are no items in the cart', async () => {
      jest.spyOn(prismaService.cartItems, 'findMany').mockResolvedValue([]);

      await expect(
        service.createOrder('testing_user_id'),
      ).rejects.toThrowErrorMatchingSnapshot('error no items in the cart');
    });

    it('should unroll nested product info and send a valid order creation query', async () => {
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
        service.createOrder('testing_user_id'),
      ).rejects.toThrowErrorMatchingSnapshot(
        'error ocurred when creating order',
      );
      expect(result).toMatchSnapshot('query of order creation test');
    });

    it('should unroll cart item IDs and send a valid query for order creation', async () => {
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

      const returned = await service.createOrder('testing_user_id');

      const input = spy.mock.calls[0];

      expect(input).toMatchSnapshot('query of delete many test');
      expect(returned).toMatchSnapshot('create order return');
    });

    it('should throw an error if deletion count is 0', async () => {
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
        service.createOrder('testing_user_id'),
      ).rejects.toThrowErrorMatchingSnapshot('error unexpected when deleting');
    });
  });

  describe('getOrderItemsByOrder', () => {});
});
