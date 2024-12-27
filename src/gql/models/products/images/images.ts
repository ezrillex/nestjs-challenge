import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Images {
  @Field(() => String)
  id: string;
  @Field(() => String)
  url: string;

  @Field(() => String)
  created_at: string;

  @Field(() => String, { nullable: true })
  product_variation_id: string;
}
