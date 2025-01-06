import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProductVariations } from '../products/product_variation/product-variations.model';

@ObjectType()
export class OrderItems {
  @Field(() => ID)
  id: string;

  // circular reference issue. omitting orders field.
  // @Field(() => Orders, { nullable: true })
  // order: Orders;

  @Field(() => ProductVariations)
  product_variation: ProductVariations;

  @Field(() => Int)
  quantity: number;

  @Field(() => Number)
  price_purchased_at: number;
}
