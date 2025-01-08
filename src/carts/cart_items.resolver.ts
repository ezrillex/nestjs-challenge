import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { CartItems } from './cart_items.model';
import { CartsService } from './carts.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

@Resolver(() => CartItems)
export class CartItemsResolver {
  constructor(
    private readonly cartsService: CartsService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  // create or update
  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async addToCart(
    @Args('variation_id', { type: () => String }, ParseUUIDPipe)
    variation_id: string,
    @Args('quantity', { type: () => Int }, ParseIntPipe) quantity: number,
    @Context('req') request: Request,
  ) {
    const result = await this.cartsService.AddToCart(
      variation_id,
      request['user'].id,
      quantity,
    );

    return result.id;
  }

  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async removeFromCart(
    @Args('cart_item_id', { type: () => String }, ParseUUIDPipe)
    cart_item_id: string,
  ) {
    return this.cartsService.RemoveCartItem(cart_item_id);
  }

  @RequiresRole(roles.customer)
  @Query(() => [CartItems], { nullable: true })
  async getCartItems(@Context('req') request: Request) {
    return this.cartsService.GetCartItems(request['user'].id);
  }

  @ResolveField()
  async cart_owner(@Parent() cart_items: CartItems) {
    const { id } = cart_items;
    const { cart_owner } =
      await this.usersService.ResolveUsersOnCartItemsField(id);
    return cart_owner;
  }

  @ResolveField()
  async product_variation(@Parent() cart_items: CartItems) {
    const { id } = cart_items;
    const { product_variation } =
      await this.productsService.ResolveProductVariationsOnCartItemsField(id);
    return product_variation;
  }
}
