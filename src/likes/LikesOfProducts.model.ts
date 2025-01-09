import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LikesOfProducts {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  user_id: string;

  @Field(() => ID)
  product_variation_id: string;
}
