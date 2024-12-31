import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async webhook(
    signature: string,
    body: ReadableStream<Uint8Array<ArrayBufferLike>>,
    req: string | Buffer<ArrayBufferLike>,
  ) {
    console.log('webhook');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SIGNING_SECRET'),
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    const payment_intent = event.data.object as Stripe.PaymentIntent;
    const order_id = payment_intent.metadata['order_id'];
    const payment_id = payment_intent.metadata['payment_id'];

    const record = await this.prisma.orders.findUnique({
      where: {
        id: order_id,
        PaymentIntents: {
          some: { id: payment_id },
        },
      },
    });

    if (!record) {
      throw new InternalServerErrorException('Specified order does not exist');
    }

    let new_status: PaymentStatus;
    switch (event.type) {
      case 'payment_intent.succeeded':
        new_status = 'succeeded';
        break;
      case 'payment_intent.payment_failed':
        new_status = payment_intent.status;
        break;
      default:
        throw new InternalServerErrorException('Unknown event type.');
    }

    await this.prisma.orders.update({
      where: { id: order_id },
      data: {
        paymentStatus: new_status,

        IncomingPaymentWebhooks: {
          create: {
            processed_at: new Date().toISOString(),
            data: JSON.stringify({ signature, body }),
          },
        },
        PaymentIntents: {
          update: {
            where: {
              id: payment_id,
            },
            data: {
              status: new_status,
            },
          },
        },
      },
    });

    return { received: true };
  }

  async createPaymentIntent(amount: number, order_id: string, user_id: string) {
    // the frontend can create many intents? my understanding is it will auto clean up on stripe side if no actions
    // meaning they need to go further with the one they specify
    // this scenario is user starts checkout but doesn't finish, so it's not fictional
    // as per stripe docs is better to start with a fresh one.

    // todo check if order is already paid?
    const record = await this.prisma.orders.findUnique({
      where: { id: order_id, user_id: user_id },
    });
    if (!record) {
      throw new NotFoundException(
        'Order specified not found. Or order does not belong to the logged in user!',
      );
    }

    const intent_record = await this.prisma.paymentIntents.create({
      data: {
        order: {
          connect: { id: order_id },
        },
      },
    });

    let paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
    try {
      paymentIntent = await this.stripe.paymentIntents.create({
        currency: 'usd',
        amount: amount,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        metadata: {
          order_id: order_id,
          payment_id: intent_record.id,
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }

    const result = await this.prisma.paymentIntents.update({
      where: { id: intent_record.id },
      data: {
        status: 'requires_payment_method',
        stripe_payment_intent: JSON.stringify(paymentIntent),
        stripe_event_id: paymentIntent.id,
      },
    });

    console.log(paymentIntent);
    return {
      payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      payment_id: result.id,
    };
  }

  async getOrderPayments(order_id: string, user_id: string) {
    // checks if order exists and because filter of user checks if is of user.
    const record = await this.prisma.orders.findUnique({
      where: { id: order_id, user_id: user_id },
    });
    if (!record) {
      throw new NotFoundException(
        'Order specified not found. Or order does not belong to the logged in user!',
      );
    }

    return this.prisma.paymentIntents.findMany({
      select: {
        id: true,
        order_id: true,
        status: true,
        created_at: true,
        stripe_event_id: true,
        // omit payment intent json
      },
      where: { order_id: order_id },
    });
  }

  // DEBUG ONLY METHOD --------------------------------------------------
  async updatePaymentIntent(payment_id: string, payment_method: string) {
    // check if order exists
    const record = await this.prisma.paymentIntents.findUnique({
      where: { id: payment_id },
    });
    if (!record) {
      throw new NotFoundException('Payment intent specified not found.');
    }
    if (record.status == 'succeeded') {
      throw new NotAcceptableException(
        'Payment has already succeeded, no further changes are allowed.',
      );
    }

    return this.stripe.paymentIntents.update(record.stripe_event_id, {
      payment_method: payment_method,
    });
  }
}
