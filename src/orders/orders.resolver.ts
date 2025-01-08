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
import { Orders } from './orders.model';
import { OrdersService } from './orders.service';
import { CartItems } from '../carts/cart_items.model';
import { UsersService } from '../users/users.service';
import { StripeService } from '../payments/stripe.service';

@Resolver(() => Orders)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService,
  ) {}

  @RequiresRole(roles.customer)
  @Mutation(() => String, { nullable: true })
  async createOrder(@Context('req') request: Request) {
    // let's assume the customer is buying the entire cart.
    return this.ordersService.CreateOrder(request['user'].id);
  }

  @RequiresRole(roles.customer)
  @Query(() => [Orders], { nullable: true })
  async getOrders(@Context('req') request: Request) {
    return this.ordersService.GetOrders(
      request['user'].id,
      request['user'].role,
    );
  }

  @RequiresRole(roles.customer)
  @Query(() => Orders, { nullable: true })
  async getOrder(
    @Args('order_id', { type: () => String }, ParseUUIDPipe)
    order_id: string,
    @Context('req') request: Request,
  ) {
    return this.ordersService.GetOrder(order_id, request['user'].id);
  }

  @RequiresRole(roles.manager)
  @Query(() => [Orders], { nullable: true })
  async getClientOrders(
    @Context('req') request: Request,
    @Args('client_id', { type: () => String, nullable: true }, ParseUUIDPipe)
    client_id: string,
  ) {
    return this.ordersService.GetOrders(
      request['user'].id,
      request['user'].role,
      client_id,
    );
  }

  @ResolveField()
  async user(@Parent() orders: Orders) {
    const { id } = orders;
    const { user } = await this.usersService.ResolveUsersOnOrdersField(id);
    return user;
  }

  @ResolveField()
  async order_items(@Parent() cart_items: Orders) {
    const { id } = cart_items;
    const { order_items } = await this.ordersService.ResolveOrderItemsField(id);
    return order_items;
  }

  @ResolveField()
  async payments(@Parent() cart_items: Orders) {
    const { id } = cart_items;
    const { PaymentIntents } =
      await this.stripeService.ResolvePaymentsOnOrdersField(id);
    return PaymentIntents;
  }
}
