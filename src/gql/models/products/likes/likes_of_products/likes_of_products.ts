import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ProductVariations } from '../../product-variations/product-variations';
import { Users } from '../../../users/users/users';

@ObjectType()
export class LikesOfProducts {
  @Field(() => ID)
  id: string;

  @Field(() => Users)
  liked_by: Users;

  @Field(() => ProductVariations)
  likes_product_variation: ProductVariations;
}
