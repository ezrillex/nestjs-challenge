import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CartsService } from './carts.service';
import { CartItems } from '@prisma/client';

describe('CartsService', () => {
  let service: CartsService;
  let prismaService: PrismaService;

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

  it('AddToCart should be defined', () => {
    expect(service.AddToCart).toBeDefined();
  });

  it('RemoveCartItem should be defined', () => {
    expect(service.RemoveCartItem).toBeDefined();
  });

  it('GetCartItems should be defined', () => {
    expect(service.GetCartItems).toBeDefined();
  });

  describe('AddToCart', () => {
    it('throws an error when the product variation ID does not exist', async () => {
      await expect(
        service.AddToCart(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          50,
        ),
      ).rejects.toThrowErrorMatchingSnapshot('product variation 404');
    });

    it('updates an existing cart item when a matching entry is found', async () => {
      jest.spyOn(prismaService.productVariations, 'count').mockResolvedValue(1);
      jest
        .spyOn(prismaService.cartItems, 'findUnique')
        .mockResolvedValue({ id: 'testing' } as CartItems);

      let updated = false;
      jest.spyOn(prismaService.cartItems, 'update').mockImplementation(() => {
        updated = true;
        return null;
      });

      await service.AddToCart(
        '2730fc05-6f87-49e5-8a41-559208048ebe',
        '2730fc05-6f87-49e5-8a41-559208048ebe',
        3,
      );
      expect(updated).toEqual(true);
    });

    it('creates a new cart item when no existing entry is found for the provided data', async () => {
      jest.spyOn(prismaService.productVariations, 'count').mockResolvedValue(1);
      jest.spyOn(prismaService.cartItems, 'findFirst').mockResolvedValue(null);

      let created = false;
      jest.spyOn(prismaService.cartItems, 'create').mockImplementation(() => {
        created = true;
        return null;
      });

      await service.AddToCart(
        '2730fc05-6f87-49e5-8a41-559208048ebe',
        '2730fc05-6f87-49e5-8a41-559208048ebe',
        3,
      );
      expect(created).toEqual(true);
    });
  });

  describe('RemoveCartItem', () => {
    it('throws an error when attempting to remove a cart item that does not exist', async () => {
      await expect(
        service.RemoveCartItem(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot(
        'tried to remove non existing cart items id',
      );
    });

    it('throws an error if the database delete operation fails without returning a deleted object', async () => {
      jest
        .spyOn(prismaService.cartItems, 'delete')
        .mockRejectedValue(new Error('testing'));
      jest.spyOn(prismaService.cartItems, 'count').mockResolvedValue(1);

      await expect(
        service.RemoveCartItem(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot(
        'delete called to db but deleted obj not returned, something is wrong',
      );
    });

    it('returns "Cart Item deleted successfully." upon successful deletion of the cart item', async () => {
      jest.spyOn(prismaService.cartItems, 'delete').mockResolvedValue({
        id: 'testing',
        user_id: 'testing',
        product_variation_id: 'testing',
        quantity: 3,
      });
      jest
        .spyOn(prismaService.cartItems, 'findUnique')
        .mockResolvedValue({ testing: 'test' } as any);

      await expect(
        service.RemoveCartItem(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).resolves.toEqual('Cart Item deleted successfully.');
    });
  });

  describe('GetCartItems', () => {
    it('should call the database with the correct query for retrieving cart items', async () => {
      const spy = jest
        .spyOn(prismaService.cartItems, 'findMany')
        .mockResolvedValue(null);

      await service.GetCartItems('2730fc05-6f87-49e5-8a41-559208048ebe');
      expect(spy.mock.calls).toMatchSnapshot('expected query get cart items');
    });
  });
});
