import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetOrdersInput {
  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => ID, { nullable: true })
  client_id?: string;
}
