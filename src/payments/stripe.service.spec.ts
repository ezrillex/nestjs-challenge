import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentIntents, PaymentStatus } from '@prisma/client';

jest.mock('stripe');

describe('Stripe Service', () => {
  let service: StripeService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  const stripeMock = Stripe as jest.MockedClass<typeof Stripe>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, PrismaService, StripeService],
    }).compile();

    service = module.get<StripeService>(StripeService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ConfigService should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('prismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('webhook should be defined', () => {
    expect(service.webhook).toBeDefined();
  });

  it('createPaymentIntent should be defined', () => {
    expect(service.createPaymentIntent).toBeDefined();
  });

  it('updatePaymentIntent should be defined', () => {
    expect(service.updatePaymentIntent).toBeDefined();
  });

  it('getOrderPayments should be defined', () => {
    expect(service.getOrderPayments).toBeDefined();
  });

  it('getPaymentsByOrder should be defined', () => {
    expect(service.getPaymentsByOrder).toBeDefined();
  });

  it('should initialize with correct key and apiVersion, and fail if version is upgraded', () => {
    expect(stripeMock).toHaveBeenCalledWith(
      expect.stringMatching(/^sk_(test|live)_[A-Za-z0-9]+$/),
      {
        apiVersion: '2024-12-18.acacia',
      },
    );
  });

  describe('createPaymentIntent', () => {
    it('should throw an error if the amount is negative', async () => {
      await expect(
        service.createPaymentIntent(
          -1,
          '8b3ae683-0626-44be-b591-9271e288388f',
          '8b3ae683-0626-44be-b591-9271e288388f',
        ),
      ).rejects.toMatchSnapshot('error amount is negative');
    });

    it('should throw an error if the amount is zero', async () => {
      await expect(
        service.createPaymentIntent(
          0,
          '8b3ae683-0626-44be-b591-9271e288388f',
          '8b3ae683-0626-44be-b591-9271e288388f',
        ),
      ).rejects.toMatchSnapshot('error amount is zero');
    });

    it('should throw an error if the order does not exist', async () => {
      await expect(
        service.createPaymentIntent(
          30,
          '8b3ae683-0626-44be-b591-9271e288388f',
          '8b3ae683-0626-44be-b591-9271e288388f',
        ),
      ).rejects.toMatchSnapshot('error order not found');
    });

    it('should pass the request to the Prisma payment intents table', async () => {
      const mockEventFunction = jest.fn(() => {
        throw new Error('mock');
      });
      stripeMock.prototype.paymentIntents = {
        create: mockEventFunction,
      } as unknown as Stripe.PaymentIntentsResource;

      jest.spyOn(prismaService.orders, 'count').mockResolvedValue(1);

      const spy = jest
        .spyOn(prismaService.paymentIntents, 'create')
        .mockResolvedValue({} as PaymentIntents);

      await expect(
        service.createPaymentIntent(
          30,
          '8b3ae683-0626-44be-b591-9271e288388f',
          '8b3ae683-0626-44be-b591-9271e288388f',
        ),
      ).rejects.toThrow('mock');

      expect(spy.mock.calls).toMatchSnapshot('query to create intent ok');
    });

    it('should pass the request to the Stripe service', async () => {
      const mockEventFunction = jest.fn(() => {
        throw new Error('mock');
      });
      stripeMock.prototype.paymentIntents = {
        create: mockEventFunction,
      } as unknown as Stripe.PaymentIntentsResource;

      jest.spyOn(prismaService.orders, 'count').mockResolvedValue(1);

      jest
        .spyOn(prismaService.paymentIntents, 'create')
        .mockResolvedValue({ id: 'some id' } as PaymentIntents);

      await expect(
        service.createPaymentIntent(
          30,
          '8b3ae683-0626-44be-b591-9271e288388f',
          '8b3ae683-0626-44be-b591-9271e288388f',
        ),
      ).rejects.toThrow('mock');

      expect(mockEventFunction.mock.calls).toMatchSnapshot(
        'query to create intent stripe',
      );
    });

    it('should update Prisma with the Stripe response and return the key data', async () => {
      const mockEventFunction = jest.fn(() => {
        return {
          id: 'payment intent id',
          client_secret: 'test client secret',
        };
      });
      stripeMock.prototype.paymentIntents = {
        create: mockEventFunction,
      } as unknown as Stripe.PaymentIntentsResource;

      jest.spyOn(prismaService.orders, 'count').mockResolvedValue(1);

      jest
        .spyOn(prismaService.paymentIntents, 'create')
        .mockResolvedValue({ id: 'some id' } as PaymentIntents);

      jest.spyOn(prismaService.paymentIntents, 'update').mockResolvedValue({
        id: '8b3ae683-0626-44be-b591-9271e288388f',
        status: PaymentStatus.requires_payment_method,
        order_id: '8b3ae683-0626-44be-b591-9271e288388f',
        created_at: new Date(2020, 12, 12, 12, 12, 12),
        stripe_event_id: '8b3ae683-0626-44be-b591-9271e288388f',
      } as PaymentIntents);

      await expect(
        service.createPaymentIntent(
          30,
          '8b3ae683-0626-44be-b591-9271e288388f',
          '8b3ae683-0626-44be-b591-9271e288388f',
        ),
      ).resolves.toMatchSnapshot('returns ok');

      expect(mockEventFunction.mock.calls).toMatchSnapshot(
        'query to create intent stripe',
      );
    });
  });

  describe('webhook', () => {
    it('should throw an error if signature header is missing', async () => {
      await expect(
        service.webhook({ headers: {} } as Request, null),
      ).rejects.toThrowErrorMatchingSnapshot(
        'missing signature in header error',
      );
    });

    it('should throw an error if the body is empty', async () => {
      await expect(
        service.webhook(
          {
            headers: { 'stripe-signature': 'some-value' },
            body: null,
          } as unknown as Request,
          null,
        ),
      ).rejects.toThrowErrorMatchingSnapshot('missing body in request error');
    });

    it('should pass request data and body to Stripe sign function', async () => {
      const mockEventFunction = jest.fn(() => {
        throw new Error('mock event');
      });
      stripeMock.prototype.webhooks = {
        constructEvent: mockEventFunction,
      } as unknown as Stripe.Webhooks;

      jest.spyOn(configService, 'get').mockReturnValue('sk_test_testing_key');

      await expect(
        service.webhook(
          {
            headers: { 'stripe-signature': 'some-value' },
            body: { random: 'value' },
          } as unknown as Request,
          Buffer.from('test'),
        ),
      ).rejects.toThrow('mock event');
      expect(mockEventFunction).toHaveBeenCalledWith(
        Buffer.from('test'),
        'some-value',
        'sk_test_testing_key',
      );
    });

    it('should fetch data from Stripe, form a request to Prisma, and throw an error if no data is found', async () => {
      const spy = jest
        .spyOn(prismaService.orders, 'count')
        .mockResolvedValue(0);

      const mockEventFunction = jest.fn(() => {
        return {
          data: {
            object: {
              metadata: {
                order_id: 'test_id',
                payment_id: 'test_payment_id',
              },
            },
          },
        };
      });
      stripeMock.prototype.webhooks = {
        constructEvent: mockEventFunction,
      } as unknown as Stripe.Webhooks;

      jest.spyOn(configService, 'get').mockReturnValue('sk_test_testing_key');

      await expect(
        service.webhook(
          {
            headers: { 'stripe-signature': 'some-value' },
            body: { random: 'value' },
          } as unknown as Request,
          Buffer.from('test'),
        ),
      ).rejects.toThrow('Specified order does not exist');
      expect(spy.mock.calls).toMatchSnapshot('prisma find payment query');
    });

    it('should throw an error if the event type is unknown and unhandled', async () => {
      jest.spyOn(prismaService.orders, 'count').mockResolvedValue(1);

      const mockEventFunction = jest.fn(() => {
        return {
          type: 'maracas',
          data: {
            object: {
              metadata: {
                order_id: 'test_id',
                payment_id: 'test_payment_id',
              },
            },
          },
        };
      });
      stripeMock.prototype.webhooks = {
        constructEvent: mockEventFunction,
      } as unknown as Stripe.Webhooks;

      jest.spyOn(configService, 'get').mockReturnValue('sk_test_testing_key');

      await expect(
        service.webhook(
          {
            headers: { 'stripe-signature': 'some-value' },
            body: { random: 'value' },
          } as unknown as Request,
          Buffer.from('test'),
        ),
      ).rejects.toThrow('Unknown event type.');
    });

    it('should update Prisma with success status and return received: true for Stripe', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2020, 12, 1, 10, 10, 59));
      jest.spyOn(prismaService.orders, 'count').mockResolvedValue(1);

      const mockEventFunction = jest.fn(() => {
        return {
          type: 'payment_intent.succeeded',
          data: {
            object: {
              metadata: {
                order_id: 'test_id',
                payment_id: 'test_payment_id',
              },
            },
          },
        };
      });
      stripeMock.prototype.webhooks = {
        constructEvent: mockEventFunction,
      } as unknown as Stripe.Webhooks;

      jest.spyOn(configService, 'get').mockReturnValue('sk_test_testing_key');

      const spy = jest
        .spyOn(prismaService.orders, 'update')
        .mockResolvedValue(null);

      await expect(
        service.webhook(
          {
            headers: { 'stripe-signature': 'some-value' },
            body: { random: 'value' },
          } as unknown as Request,
          Buffer.from('test'),
        ),
      ).resolves.toEqual({
        received: true,
      });

      expect(spy.mock.calls).toMatchSnapshot('update status ok order');
    });

    it('should update Prisma with failed status and return received: true for Stripe', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2020, 12, 1, 10, 10, 59));
      jest.spyOn(prismaService.orders, 'count').mockResolvedValue(1);

      const mockEventFunction = jest.fn(() => {
        return {
          type: 'payment_intent.payment_failed',
          data: {
            object: {
              metadata: {
                order_id: 'test_id',
                payment_id: 'test_payment_id',
              },
            },
          },
        };
      });
      stripeMock.prototype.webhooks = {
        constructEvent: mockEventFunction,
      } as unknown as Stripe.Webhooks;

      jest.spyOn(configService, 'get').mockReturnValue('sk_test_testing_key');

      const spy = jest
        .spyOn(prismaService.orders, 'update')
        .mockResolvedValue(null);

      await expect(
        service.webhook(
          {
            headers: { 'stripe-signature': 'some-value' },
            body: { random: 'value' },
          } as unknown as Request,
          Buffer.from('test'),
        ),
      ).resolves.toEqual({
        received: true,
      });

      expect(spy.mock.calls).toMatchSnapshot(
        'update status payment_failed order',
      );
    });
  });

  describe('updatePaymentIntent', () => {
    it('should throw an error if the payment intent is not found', async () => {
      jest
        .spyOn(prismaService.paymentIntents, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.updatePaymentIntent('payment id', 'new payment method'),
      ).rejects.toThrowErrorMatchingSnapshot('intent not found error');
    });

    it('should throw an error if the payment intent status is already completed', async () => {
      jest.spyOn(prismaService.paymentIntents, 'findUnique').mockResolvedValue({
        status: 'succeeded',
      } as PaymentIntents);

      await expect(
        service.updatePaymentIntent('payment id', 'new payment method'),
      ).rejects.toThrowErrorMatchingSnapshot('intent already completed error');
    });

    it('should pass an update query to Prisma for the payment intent', async () => {
      jest.spyOn(prismaService.paymentIntents, 'findUnique').mockResolvedValue({
        stripe_event_id: 'test_id',
        status: 'requires_payment_method',
      } as PaymentIntents);

      const mockUpdateFunction = jest.fn();
      stripeMock.prototype.paymentIntents = {
        update: mockUpdateFunction,
      } as unknown as Stripe.PaymentIntentsResource;

      await expect(
        service.updatePaymentIntent('payment id', 'new payment method'),
      ).resolves.not.toThrow();

      expect(mockUpdateFunction.mock.calls).toMatchSnapshot(
        'sends the update payment method to stripe in query',
      );
    });
  });

  describe('getOrderPayments', () => {
    it('should throw an error if the order with the user is not found', async () => {
      await expect(
        service.getOrderPayments(
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('order user combo not found');
    });

    it('should return all payment intents associated with the order', async () => {
      jest.spyOn(prismaService.orders, 'count').mockResolvedValue(1);

      const spy = jest
        .spyOn(prismaService.paymentIntents, 'findMany')
        .mockResolvedValue(null);

      await expect(
        service.getOrderPayments(
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
        ),
      ).resolves.not.toThrow();

      expect(spy.mock.calls).toMatchSnapshot(
        'query of payments with select fields',
      );
    });
  });

  describe('getPaymentsByOrder', () => {});
});
