import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderItems } from './order-items';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Users } from '../users/users/users';

@ObjectType()
export class Orders {
  @Field(() => ID)
  id: string;

  @Field(() => Users)
  user: Users;

  //payments: [PaymentIntents!]
  //webhooks: [IncomingPaymentWebhooks!]
  //orderDetails: [OrderDetails!]!

  @Field(() => String)
  paymentStatus: PaymentStatus;

  @Field(() => String)
  orderStatus: OrderStatus;

  //orderStatusHistory: [OrderAudit!]!

  @Field(() => [OrderItems])
  order_items: OrderItems[];
}
