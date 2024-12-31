import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseUUIDPipe } from '@nestjs/common';
import { Orders } from './orders.model';
import { OrdersService } from './orders.service';

@Resolver()
export class OrdersResolver {
  // todo refactor this into its separate service?
  constructor(private readonly ordersService: OrdersService) {}

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
}
