import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Orders } from './orders';
import { ProductVariations } from '../products/product-variations/product-variations';

@ObjectType()
export class OrderItems {
  @Field(() => ID)
  id: string;

  @Field(() => Orders)
  order: Orders;

  @Field(() => ProductVariations)
  product_variation: ProductVariations;

  @Field(() => Int)
  quantity: number;

  @Field(() => Number)
  price_purchased_at: number;
}
