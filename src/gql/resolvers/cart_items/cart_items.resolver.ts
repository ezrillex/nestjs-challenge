import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequiresRole } from '../../../decorators/requires-role/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseUUIDPipe } from '@nestjs/common';
import { LikesOfProducts } from '../../models/products/likes/likes_of_products/likes_of_products';
import { ProductsService } from '../../../services/products/products.service';

@Resolver()
export class CartItemsResolver {
  constructor(private readonly productsService: ProductsService) {}

  // create or update
  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async addToCart(
    @Args('variation_id', { type: () => String }, ParseUUIDPipe)
    variation_id: string,
    @Context('req') request: Request,
  ) {
    const result = await this.productsService.AddToCart(
      variation_id,
      request['user'].id,
    );

    return result.id;
  }

  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async removeFromCart(
    @Args('cart_item_id', { type: () => String }, ParseUUIDPipe)
    cart_item_id: string,
  ) {
    return this.productsService.RemoveCartItem(cart_item_id);
  }

  @RequiresRole(roles.customer)
  @Query(() => [LikesOfProducts], { nullable: true })
  async getCartItems(@Context('req') request: Request) {
    return this.productsService.GetCartItems(request['user'].id);
  }
}
