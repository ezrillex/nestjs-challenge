import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Images {
  @Field(() => String)
  id: string;
  @Field(() => String)
  url: string;

  @Field(() => Date)
  created_at: Date;

  @Field(() => String, { nullable: true })
  product_variation_id: string;
}
