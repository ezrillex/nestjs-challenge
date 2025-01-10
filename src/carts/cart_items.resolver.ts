import {
  Args,
  Context,
  ID,
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
import { ProductVariations } from '../products/product_variation/product-variations.model';
import { Users } from '../users/users.model';

@Resolver(() => CartItems)
export class CartItemsResolver {
  constructor(
    private readonly cartsService: CartsService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  // create or update
  @RequiresRole(roles.customer)
  @Mutation(() => CartItems, { nullable: true })
  async addToCart(
    @Args('variation_id', { type: () => ID }, ParseUUIDPipe)
    variation_id: string,
    @Args('quantity', { type: () => Int }, ParseIntPipe) quantity: number,
    @Context('req') request: Request,
  ): Promise<CartItems> {
    return await this.cartsService.AddToCart(
      variation_id,
      request['user'].id,
      quantity,
    );
  }

  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async removeFromCart(
    @Args('product_variation_id', { type: () => String }, ParseUUIDPipe)
    product_variation_id: string,
    @Context('req') request: Request,
  ): Promise<string> {
    return this.cartsService.RemoveCartItem(
      product_variation_id,
      request['user'].id,
    );
  }

  @RequiresRole(roles.customer)
  @Query(() => [CartItems], { nullable: true })
  async getCartItems(@Context('req') request: Request): Promise<CartItems[]> {
    return this.cartsService.GetCartItems(request['user'].id);
  }

  @ResolveField()
  async cart_owner(@Parent() cart_items: CartItems): Promise<Users> {
    const { id } = cart_items;
    return this.usersService.ResolveUsersOnCartItemsField(id);
  }

  @ResolveField()
  async product_variation(
    @Parent() cart_items: CartItems,
  ): Promise<ProductVariations> {
    const { id } = cart_items;
    return this.productsService.ResolveProductVariationOnCartItems(id);
  }
}
