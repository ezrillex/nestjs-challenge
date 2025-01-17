import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseUUIDPipe } from '@nestjs/common';
import { LikesService } from './likes.service';
import { ProductVariations } from '../products/product_variation/product-variations.model';
import { LikesOfProducts } from './LikesOfProducts.model';

@Resolver()
export class LikesResolver {
  constructor(private readonly likesService: LikesService) {}

  @RequiresRole(roles.customer)
  @Mutation(() => LikesOfProducts, { nullable: true })
  async toggleLike(
    @Args('product_variation_id', { type: () => String }, ParseUUIDPipe)
    id: string,
    @Context('req') request: Request,
  ): Promise<LikesOfProducts> {
    return this.likesService.toggleLike(id, request['user'].id);
  }

  @RequiresRole(roles.customer)
  @Query(() => [ProductVariations], { nullable: true })
  async getLikes(
    @Context('req') request: Request,
  ): Promise<ProductVariations[]> {
    return this.likesService.getLikes(request['user'].id);
  }
}
