import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseUUIDPipe } from '@nestjs/common';
import { LikesOfProducts } from './likes_of_products.model';
import { LikesService } from './likes.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

@Resolver(() => LikesOfProducts)
export class LikesResolver {
  constructor(
    private readonly likesService: LikesService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async likeProduct(
    @Args('variation_id', { type: () => String }, ParseUUIDPipe)
    variation_id: string,
    @Context('req') request: Request,
  ) {
    return (
      await this.likesService.LikeProduct(variation_id, request['user'].id)
    ).id;
  }

  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async removeLikeProduct(
    @Args('like_id', { type: () => String }, ParseUUIDPipe)
    like_id: string,
  ) {
    return (await this.likesService.RemoveLike(like_id)).result;
  }

  @RequiresRole(roles.customer)
  @Query(() => [LikesOfProducts], { nullable: true })
  async getLikes(@Context('req') request: Request) {
    return this.likesService.GetLikes(request['user'].id);
  }

  @ResolveField()
  async likes_product_variation(@Parent() likesOfProduct: LikesOfProducts) {
    const { id } = likesOfProduct;
    const { likes_product_variation } =
      await this.productsService.ResolveProductVariationsOnLikesOfProductsField(
        id,
      );
    return likes_product_variation;
  }

  @ResolveField()
  async liked_by(@Parent() likesOfProduct: LikesOfProducts) {
    const { id } = likesOfProduct;
    const { liked_by } =
      await this.usersService.ResolveUsersOnLikesOfProductsField(id);
    return liked_by;
  }
}
