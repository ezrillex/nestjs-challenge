import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseUUIDPipe } from '@nestjs/common';
import { LikesOfProducts } from './likes_of_products';
import { LikesService } from './likes.service';

@Resolver()
export class LikesResolver {
  // todo refactor this into its separate service?
  constructor(private readonly likesService: LikesService) {}

  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async likeProduct(
    @Args('variation_id', { type: () => String }, ParseUUIDPipe)
    variation_id: string,
    @Context('req') request: Request,
  ) {
    const result = await this.likesService.LikeProduct(
      variation_id,
      request['user'].id,
    );

    return result.id;
  }

  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async removeLikeProduct(
    @Args('like_id', { type: () => String }, ParseUUIDPipe)
    like_id: string,
  ) {
    return this.likesService.RemoveLike(like_id);
  }

  @RequiresRole(roles.customer)
  @Query(() => [LikesOfProducts], { nullable: true })
  async getLikes(@Context('req') request: Request) {
    return this.likesService.GetLikes(request['user'].id);
  }
}
