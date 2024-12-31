import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderItems } from './order_items.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Users } from '../auth/users.model';

@ObjectType()
export class Orders {
  @Field(() => ID)
  id: string;

  @Field(() => Users)
  user: Users;

  // todo when implementing resolve field maybe add this
  //payments: [PaymentIntents!]
  //webhooks: [IncomingPaymentWebhooks!]

  // todo change to snake case
  @Field(() => String)
  paymentStatus: PaymentStatus;

  @Field(() => String)
  orderStatus: OrderStatus;

  //orderStatusHistory: [OrderAudit!]!

  @Field(() => [OrderItems])
  order_items: OrderItems[];
}
