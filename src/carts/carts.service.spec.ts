import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CartsService } from './carts.service';
import { CartItems } from '@prisma/client';

describe('Carts Service', () => {
  let service: CartsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, CartsService],
    }).compile();

    service = module.get<CartsService>(CartsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have method add to cart', () => {
    expect(service.AddToCart).toBeDefined();
  });

  it('should have method Remove cart item', () => {
    expect(service.RemoveCartItem).toBeDefined();
  });

  it('should have method Get cart items', () => {
    expect(service.GetCartItems).toBeDefined();
  });

  describe('Add a Product to cart Tests', () => {
    it('Should error if nonexistent uuid of product variation is passed.', async () => {
      await expect(
        service.AddToCart(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          50,
        ),
      ).rejects.toThrowErrorMatchingSnapshot('product variation 404');
    });

    it('Should if given an id update an existing element', async () => {
      jest.spyOn(prismaService.productVariations, 'count').mockResolvedValue(1);
      jest
        .spyOn(prismaService.cartItems, 'findFirst')
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

    it('Should if no id provided create a new element', async () => {
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

  describe('Remove a Product from cart Tests', () => {
    it('Should error if a cart item id is invalid', async () => {
      await expect(
        service.RemoveCartItem(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot(
        'tried to remove non existing cart items id',
      );
    });

    it('Should error if after deletion the object to return is null', async () => {
      jest.spyOn(prismaService.cartItems, 'delete').mockResolvedValue(null);
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

    it('Should return a specific message when successful', async () => {
      jest.spyOn(prismaService.cartItems, 'delete').mockResolvedValue({
        id: 'testing',
        user_id: 'testing',
        product_variation_id: 'testing',
        quantity: 3,
      });
      jest.spyOn(prismaService.cartItems, 'count').mockResolvedValue(1);

      await expect(
        service.RemoveCartItem(
          '2730fc05-6f87-49e5-8a41-559208048ebe',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).resolves.toEqual('Cart Item deleted successfully.');
    });
  });

  describe('Get Cart Items', () => {
    it('Should perform a well formed request to prisma', async () => {
      const spy = jest
        .spyOn(prismaService.cartItems, 'findMany')
        .mockResolvedValue(null);

      await service.GetCartItems('2730fc05-6f87-49e5-8a41-559208048ebe');
      expect(spy.mock.calls).toMatchSnapshot('expected query get cart items');
    });
  });
});
