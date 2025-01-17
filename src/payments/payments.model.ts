import { PaymentStatus } from '@prisma/client';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentIntents {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  status: PaymentStatus;

  @Field(() => Date)
  created_at: Date;

  @Field(() => ID)
  stripe_event_id: string;
}
