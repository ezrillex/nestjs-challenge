import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductVariationInput {
  @Field(() => ID)
  product_id: string;

  @Field(() => String)
  title: string;

  @Field(() => Number)
  price: number;

  @Field(() => Int)
  stock: number;
}
