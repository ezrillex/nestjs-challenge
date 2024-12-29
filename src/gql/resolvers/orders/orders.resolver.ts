import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductsService } from '../../../services/products/products.service';
import { RequiresRole } from '../../../decorators/requires-role/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver()
export class OrdersResolver {
  // todo refactor this into its separate service?
  constructor(private productsService: ProductsService) {}

  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async createOrder(@Context('req') request: Request) {
    // let's assume the customer is buying the entire cart.
    return this.productsService.CreateOrder(request['user'].id);
  }

  // @RequiresRole(roles.customer)
  // @Mutation(() => String, { nullable: true })
  // async removeLikeProduct(
  //   @Args('like_id', { type: () => String }, ParseUUIDPipe)
  //   like_id: string,
  // ) {
  //   return this.productsService.RemoveLike(like_id);
  // }
  //
  // @RequiresRole(roles.customer)
  // @Query(() => [LikesOfProducts], { nullable: true })
  // async getLikes(@Context('req') request: Request) {
  //   return this.productsService.GetLikes(request['user'].id);
  // }
}
