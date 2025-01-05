import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentIntents } from '@prisma/client';

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

  it('should be defined', () => {
    expect(service.webhook).toBeDefined();
  });

  it('should be defined', () => {
    expect(service.createPaymentIntent).toBeDefined();
  });

  it('should be defined', () => {
    expect(service.updatePaymentIntent).toBeDefined();
  });

  it('should be defined', () => {
    expect(service.getOrderPayments).toBeDefined();
  });

  it('should be initialized with key and version, we want to break the test if a version is upgraded', () => {
    expect(stripeMock).toHaveBeenCalledWith(
      expect.stringMatching(/^sk_(test|live)_[A-Za-z0-9]+$/),
      {
        apiVersion: '2024-12-18.acacia',
      },
    );
  });

  describe('webhook', () => {
    it('should throw if no headers for signature', async () => {
      await expect(
        service.webhook({ headers: {} } as Request, null),
      ).rejects.toThrowErrorMatchingSnapshot(
        'missing signature in header error',
      );
    });

    it('should error if empty body', async () => {
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

    it('should pass data from request and body to sign stripe function', async () => {
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

    it('should get data from stripe and try to form a request to prisma and throws if prisma returns nothing', async () => {
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

    it('should throw if event type unkown', async () => {
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

    it('should form an update request to prisma with success and return received true for stripe', async () => {
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

    it('should form an update request to prisma with failed and return received true for stripe', async () => {
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

  describe('debug method, update payment intent', () => {
    it('throws if cant find the payment intent', async () => {
      jest
        .spyOn(prismaService.paymentIntents, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.updatePaymentIntent('payment id', 'new payment method'),
      ).rejects.toThrowErrorMatchingSnapshot('intent not found error');
    });

    it('throws if status is already completed', async () => {
      jest.spyOn(prismaService.paymentIntents, 'findUnique').mockResolvedValue({
        status: 'succeeded',
      } as PaymentIntents);

      await expect(
        service.updatePaymentIntent('payment id', 'new payment method'),
      ).rejects.toThrowErrorMatchingSnapshot('intent already completed error');
    });

    it('passes a query to update to prisma', async () => {
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

  describe('get order payments', () => {
    it('throws if cant find order with user', async () => {
      await expect(
        service.getOrderPayments(
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
          '076b5b00-c719-40c3-a8f2-d1a11c17b75c',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('order user combo not found');
    });

    it('if valid queries for a list with all the payment intents associated', async () => {
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
});
