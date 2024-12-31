import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Users } from '../auth/users.model';
import { ProductVariations } from '../products/product_variation/product-variations';

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
