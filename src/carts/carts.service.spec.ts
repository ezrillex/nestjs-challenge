import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CartsService } from './carts.service';
import { CartItems } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { FakerSeed } from '../constants';
import { BadRequestException } from '@nestjs/common';

describe('CartsService', () => {
  let service: CartsService;
  let prismaService: PrismaService;

  faker.seed(FakerSeed);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, CartsService],
    }).compile();

    service = module.get<CartsService>(CartsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('CartsService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('PrismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  describe('addToCart', () => {
    it('addToCart should be defined', () => {
      expect(service.addToCart).toBeDefined();
    });

    it('throws an error when the product variation ID does not exist', async () => {
      await expect(
        service.addToCart(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          50,
        ),
      ).rejects.toThrow(
        new BadRequestException('Product Variation not found!'),
      );
    });

    it('updates an existing cart item when a matching entry is found', async () => {
      const recordToUpdate: CartItems = {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
        product_variation_id: faker.string.uuid(),
        quantity: faker.number.int(),
      };
      const findSpy = jest
        .spyOn(prismaService.cartItems, 'findUnique')
        .mockResolvedValue(recordToUpdate);
      const countSpy = jest
        .spyOn(prismaService.productVariations, 'count')
        .mockResolvedValue(1);
      const spy = jest
        .spyOn(prismaService.cartItems, 'update')
        .mockResolvedValue(recordToUpdate);

      const params: [string, string, number] = [
        faker.string.uuid(), // variation
        faker.string.uuid(), // user
        faker.number.int(), // quantity
      ];

      await expect(service.addToCart(...params)).resolves.toEqual(
        recordToUpdate,
      );
      expect(spy).toHaveBeenCalledWith({
        where: { id: recordToUpdate.id },
        data: {
          quantity: params[2],
        },
      });
      expect(countSpy).toHaveBeenCalledWith({
        where: {
          id: params[0],
          product: {
            is_published: true,
            is_deleted: false,
          },
        },
      });
      expect(findSpy).toHaveBeenCalledWith({
        where: {
          user_id_product_variation_id: {
            product_variation_id: params[0],
            user_id: params[1],
          },
        },
      });
    });

    it('creates a new cart item when no existing entry is found for the provided data', async () => {
      const countSpy = jest
        .spyOn(prismaService.productVariations, 'count')
        .mockResolvedValue(1);
      const findSpy = jest
        .spyOn(prismaService.cartItems, 'findUnique')
        .mockResolvedValue(null);
      const output: CartItems = {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
        product_variation_id: faker.string.uuid(),
        quantity: faker.number.int(),
      };
      const spy = jest
        .spyOn(prismaService.cartItems, 'create')
        .mockResolvedValue(output);

      const params: [string, string, number] = [
        faker.string.uuid(), // variation
        faker.string.uuid(), // user
        faker.number.int(), // quantity
      ];

      await expect(service.addToCart(...params)).resolves.toEqual(output);
      expect(spy).toHaveBeenCalledWith({
        data: {
          cart_owner: {
            connect: { id: params[1] },
          },
          product_variation: {
            connect: { id: params[0] },
          },
          quantity: params[2],
        },
      });
      expect(countSpy).toHaveBeenCalledWith({
        where: {
          id: params[0],
          product: {
            is_published: true,
            is_deleted: false,
          },
        },
      });
      expect(findSpy).toHaveBeenCalledWith({
        where: {
          user_id_product_variation_id: {
            product_variation_id: params[0],
            user_id: params[1],
          },
        },
      });
    });

    it('throws an error when the quantity to add is negative', async () => {
      const test = service.addToCart(
        faker.string.uuid(),
        faker.string.uuid(),
        -faker.number.int(),
      );
      await expect(test).rejects.toThrow(
        new BadRequestException('Quantity must be greater than 0'),
      );
    });

    it('throws an error when the quantity to add is zero', async () => {
      const test = service.addToCart(
        faker.string.uuid(),
        faker.string.uuid(),
        0,
      );
      await expect(test).rejects.toThrow(
        new BadRequestException('Quantity must be greater than 0'),
      );
    });
  });

  describe('removeFromCart', () => {
    it('removeFromCart should be defined', () => {
      expect(service.removeFromCart).toBeDefined();
    });

    it('throws an error when attempting to remove a cart item that does not exist', async () => {
      const spy = jest.spyOn(prismaService.cartItems, 'findUnique');
      const product_variation_id = faker.string.uuid();
      const user_id = faker.string.uuid();
      await expect(
        service.removeFromCart(product_variation_id, user_id),
      ).rejects.toThrow(new BadRequestException('Cart Item not found!'));
      expect(spy).toHaveBeenCalledWith({
        where: {
          user_id_product_variation_id: {
            product_variation_id,
            user_id,
          },
        },
        select: {
          id: true,
        },
      });
    });

    it('throws an error if the database delete operation fails without returning a deleted object', async () => {
      const product_variation_id = faker.string.uuid();
      const user_id = faker.string.uuid();

      const id = faker.string.uuid();
      const spy = jest.spyOn(prismaService.cartItems, 'delete');
      const findSpy = jest
        .spyOn(prismaService.cartItems, 'findUnique')
        .mockResolvedValue({
          id,
          product_variation_id: faker.string.uuid(),
          user_id: faker.string.uuid(),
          quantity: faker.number.int(),
        });

      await expect(
        service.removeFromCart(product_variation_id, user_id),
      ).rejects.toThrowErrorMatchingSnapshot('Prisma delete error, not found');
      expect(spy).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(findSpy).toHaveBeenCalledWith({
        where: {
          user_id_product_variation_id: {
            product_variation_id,
            user_id,
          },
        },
        select: {
          id: true,
        },
      });
    });

    it('returns "Cart Item deleted successfully." upon successful deletion of the cart item', async () => {
      const product_variation_id = faker.string.uuid();
      const user_id = faker.string.uuid();

      const id = faker.string.uuid();
      const findSpy = jest
        .spyOn(prismaService.cartItems, 'findUnique')
        .mockResolvedValue({
          id,
          product_variation_id: faker.string.uuid(),
          user_id: faker.string.uuid(),
          quantity: faker.number.int(),
        });
      const spy = jest
        .spyOn(prismaService.cartItems, 'delete')
        .mockResolvedValue({
          id: 'testing',
          user_id: 'testing',
          product_variation_id: 'testing',
          quantity: 3,
        });

      await expect(
        service.removeFromCart(product_variation_id, user_id),
      ).resolves.toEqual('Cart Item deleted successfully.');
      expect(spy).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
      expect(findSpy).toHaveBeenCalledWith({
        where: {
          user_id_product_variation_id: {
            product_variation_id,
            user_id,
          },
        },
        select: {
          id: true,
        },
      });
    });
  });

  describe('getCartItems', () => {
    it('getCartItems should be defined', () => {
      expect(service.getCartItems).toBeDefined();
    });

    it('should call the database with the correct query for retrieving cart items', async () => {
      const items: CartItems[] = faker.helpers.multiple(
        (): CartItems => {
          return {
            id: faker.string.uuid(),
            user_id: faker.string.uuid(),
            product_variation_id: faker.string.uuid(),
            quantity: faker.number.int(),
          };
        },
        { count: 10 },
      );
      const spy = jest
        .spyOn(prismaService.cartItems, 'findMany')
        .mockResolvedValue(items);
      const user_id = faker.string.uuid();
      await expect(service.getCartItems(user_id)).resolves.toBe(items);
      expect(spy).toHaveBeenCalledWith({
        where: {
          user_id: user_id,
          // hide deleted or private items.
          product_variation: {
            product: { is_deleted: false, is_published: true },
          },
        },
      });
    });
  });
});
