import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderItems } from './order-items/order_items.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Users } from '../users/users.model';
import { PaymentIntents } from '../payments/payments.model';

@ObjectType()
export class Orders {
  @Field(() => ID)
  id: string;

  @Field(() => Users)
  user?: Users;

  @Field(() => [PaymentIntents])
  payments?: [PaymentIntents];

  @Field(() => String)
  paymentStatus: PaymentStatus;

  @Field(() => String)
  orderStatus: OrderStatus;

  @Field(() => [OrderItems])
  order_items?: OrderItems[];
}
