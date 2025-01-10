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

  @RequiresRole(roles.customer)
  @Mutation(() => LikesOfProducts, { nullable: true })
  async toggleLike(
    @Args('product_variation_id', { type: () => String }, ParseUUIDPipe)
    id: string,
    @Context('req') request: Request,
  ): Promise<LikesOfProducts> {
    return this.likesService.ToggleLike(id, request['user'].id);
  }

  @RequiresRole(roles.customer)
  @Query(() => [ProductVariations], { nullable: true })
  async getLikes(@Context('req') request: Request) {
    return this.likesService.GetLikes(request['user'].id);
  }
}
