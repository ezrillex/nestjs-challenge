import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProductVariations } from '../products/product-variations/product-variations';

@ObjectType()
export class OrderItems {
  @Field(() => ID)
  id: string;

  // circular reference issue. omitting this info.
  // @Field(() => Orders, { nullable: true })
  // order: Orders;

  @Field(() => ProductVariations)
  product_variation: ProductVariations;

  @Field(() => Int)
  quantity: number;

  @Field(() => Number)
  price_purchased_at: number;
}
