import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => [ID], { nullable: true })
  categories: string[];

  @Field(() => Boolean, { nullable: true })
  is_published: boolean;

  // todo maybe once we do resolve field we can play with nested stuff
  // @Field(() => [UpdateProductVariationInput])
  // variations: UpdateProductVariationInput[];
}
