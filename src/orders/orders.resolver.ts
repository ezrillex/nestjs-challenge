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
import { UsersService } from '../users/users.service';
import { StripeService } from '../payments/stripe.service';
import { GetOrdersInput } from './inputs/get_orders.input';
import { Users } from '../users/users.model';
import { OrderItems } from './order_items.model';
import { PaymentIntents } from '../payments/payments.model';

@Resolver(() => Orders)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService,
  ) {}

  @RequiresRole(roles.customer)
  @Mutation(() => Orders, { nullable: true })
  async createOrder(@Context('req') request: Request): Promise<Orders> {
    // let's assume the customer is buying the entire cart.
    return this.ordersService.CreateOrder(request['user'].id);
  }

  @Query(() => [Orders], { nullable: true })
  async getOrders(
    @Args('GetOrdersInput') getOrdersInput: GetOrdersInput,
    @Context('req') request: Request,
  ): Promise<Orders[]> {
    return this.ordersService.GetOrders(
      request['user'].id,
      request['user'].role,
      getOrdersInput,
    );
  }

  @Query(() => Orders, { nullable: true })
  async getOrder(
    @Args('order_id', { type: () => String }, ParseUUIDPipe)
    order_id: string,
    @Context('req') request: Request,
  ): Promise<Orders> {
    return this.ordersService.GetOrder(
      order_id,
      request['user'].id,
      request['user'].role,
    );
  }

  @ResolveField()
  async user(@Parent() orders: Orders): Promise<Users> {
    const { id } = orders;
    return this.usersService.ResolveUsersOnOrdersField(id);
  }

  @ResolveField()
  async order_items(@Parent() cart_items: Orders): Promise<OrderItems[]> {
    const { id } = cart_items;
    return this.ordersService.ResolveOrderItemsField(id);
  }

  @ResolveField()
  async payments(@Parent() cart_items: Orders): Promise<PaymentIntents[]> {
    const { id } = cart_items;
    return this.stripeService.ResolvePaymentsOnOrdersField(id);
  }
}
