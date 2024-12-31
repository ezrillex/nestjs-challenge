import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Users } from '../auth/users.model';
import { ProductVariations } from '../products/product_variation/product-variations';

@ObjectType()
export class LikesOfProducts {
  @Field(() => ID)
  id: string;

  @Field(() => Users)
  liked_by: Users;

  @Field(() => ProductVariations)
  likes_product_variation: ProductVariations;
}
