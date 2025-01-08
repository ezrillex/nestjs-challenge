import { PaymentStatus } from '@prisma/client';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentIntents {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  status: PaymentStatus;

  @Field(() => String)
  created_at: string;

  @Field(() => ID)
  stripe_event_id: string;
}
