import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Users } from '../users/users.model';
import { ProductVariations } from '../products/product_variation/product-variations.model';

@ObjectType()
export class LikesOfProducts {
  @Field(() => ID)
  id: string;

  @Field(() => Users, { nullable: true })
  liked_by: Users;

  @Field(() => ProductVariations)
  likes_product_variation: ProductVariations;
}
