import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { roles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Orders } from './orders.model';
import { GetOrdersInput } from './inputs/get_orders.input';
import { OrderItems } from './order-items/order_items.model';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async CreateOrder(user_id: string): Promise<Orders> {
    const cart_items = await this.prisma.cartItems.findMany({
      select: {
        id: true,
        quantity: true,
        product_variation_id: true,
        product_variation: {
          select: {
            price: true,
          },
        },
      },
      where: {
        user_id: user_id,
        product_variation: {
          product: { is_deleted: false, is_published: true },
        },
      },
    });
    if (cart_items.length === 0) {
      throw new BadRequestException('User has no items in cart!');
    }

    const order_items = cart_items.map((item) => ({
      quantity: item.quantity,
      product_variation_id: item.product_variation_id,
      price_purchased_at: item.product_variation.price,
    }));
    const cart_ids = cart_items.map((item) => item.id);

    const create_query = {
      data: {
        user: {
          connect: { id: user_id },
        },
        order_items: {
          createMany: {
            data: order_items,
          },
        },
      },
    };

    const delete_query = {
      where: {
        id: {
          in: cart_ids,
        },
      },
    };

    try {
      return await this.prisma.$transaction(async () => {
        const create_result = await this.prisma.orders.create(create_query);
        const delete_result =
          await this.prisma.cartItems.deleteMany(delete_query);
        if (delete_result.count === 0) {
          throw new InternalServerErrorException('Error deleting cart items!');
        }
        return create_result;
      });
    } catch {
      throw new InternalServerErrorException(
        'Transaction failed: An error occurred when creating the order!',
      );
    }
  }

  async GetOrders(
    user_id: string,
    role: roles,
    inputs: GetOrdersInput,
  ): Promise<Orders[]> {
    const find_parameters = {};
    const pagination = { skip: inputs?.offset ?? 0, take: inputs?.first ?? 10 };

    switch (role) {
      case 'customer':
        find_parameters['where'] = {
          user_id: user_id,
          // don't hide deleted or private items.
        };
        break;
      case 'manager':
        if (inputs?.client_id) {
          find_parameters['where'] = {
            user_id: inputs.client_id,
            // don't hide deleted or private items.
          };
        }
        break;
      default:
        throw new InternalServerErrorException(
          'Invalid role expected customer or manager',
        );
    }

    return this.prisma.orders.findMany({ ...find_parameters, ...pagination });
  }

  async GetOrder(
    order_id: string,
    client_id: string,
    role: roles,
  ): Promise<Orders> {
    const filter = {
      id: order_id,
    };
    // if not a manager is only allowed to view its own orders.
    if (role !== roles.manager) {
      filter['user_id'] = client_id;
    }
    const find_parameters = {
      where: { ...filter },
    };

    // todo should I error if there is nothing ? if not from self user it returns null is it graphql way of doing it like so?
    return this.prisma.orders.findUnique(find_parameters);
  }

  async ResolveOrderItemsField(order_id: string): Promise<OrderItems[]> {
    const { order_items } = await this.prisma.orders.findUnique({
      where: {
        id: order_id,
      },
      select: {
        order_items: true,
      },
    });
    return order_items;
  }
}
