import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Users } from '../../users/users/users';
import { ProductVariations } from '../../products/product-variations/product-variations';

@ObjectType()
export class CartItems {
  @Field(() => ID)
  id: string;

  @Field(() => Users)
  cart_owner: Users;

  @Field(() => ProductVariations)
  product_variation: ProductVariations;

  @Field(() => Int)
  quantity: number;
}
