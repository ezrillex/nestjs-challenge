import {
  Args,
  Context,
  Directive,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseBoolPipe, ParseUUIDPipe } from '@nestjs/common';
import { LikesService } from './likes.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { ProductVariations } from '../products/product_variation/product-variations.model';
import { LikesOfProducts } from './LikesOfProducts.model';

@Resolver()
export class LikesResolver {
  constructor(
    private readonly likesService: LikesService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  @Directive('@deprecated(reason: "Use toggleLikes instead")')
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

  @Directive('@deprecated(reason: "Use toggleLikes instead")')
  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async removeLikeProduct(
    @Args('like_id', { type: () => String }, ParseUUIDPipe)
    like_id: string,
  ) {
    return (await this.likesService.RemoveLike(like_id)).result;
  }

  @RequiresRole(roles.customer)
  @Mutation(() => LikesOfProducts)
  async toggleLike(
    @Args('product_variation_id', { type: () => String }, ParseUUIDPipe)
    id: string,
    @Args('status', { type: () => Boolean }, ParseBoolPipe)
    status: boolean,
    @Context('req') request: Request,
  ) {
    return this.likesService.ToggleLike(id, status, request['user'].id);
  }

  @RequiresRole(roles.customer)
  @Query(() => [ProductVariations], { nullable: true })
  async getLikes(@Context('req') request: Request) {
    return this.likesService.GetLikes(request['user'].id);
  }
}
