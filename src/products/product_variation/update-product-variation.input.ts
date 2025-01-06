import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateProductVariationInput {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => Number, { nullable: true })
  price: number;

  @Field(() => Int, { nullable: true })
  stock: number;
}
