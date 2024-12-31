import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { roles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async CreateOrder(user_id: string) {
    const cart_items = await this.prisma.cartItems.findMany({
      include: { product_variation: true },
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

    const order_result = await this.prisma.orders.create({
      include: {
        order_items: true,
        user: true,
      },
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
    });
    if (!order_result) {
      throw new InternalServerErrorException(
        'An error occurred when creating the order!',
      );
    }
    const cart_ids = cart_items.map((item) => item.id);
    const delete_result = await this.prisma.cartItems.deleteMany({
      where: {
        id: {
          in: cart_ids,
        },
      },
    });
    if (delete_result.count === 0) {
      throw new InternalServerErrorException('An unexpected error occurred!');
    } else {
      return order_result.id;
    }
  }

  async GetOrders(user_id: string, role: roles, client_id: string = null) {
    // TODO A resolve field can take care of a lot of this include stuff
    const find_parameters = {
      include: {
        user: true,
        order_items: {
          include: { product_variation: true },
        },
      },
    };

    if (role === roles.customer) {
      find_parameters['where'] = {
        user_id: user_id,
        // don't hide deleted or private items.
      };
    } else if (role === roles.manager && client_id) {
      find_parameters['where'] = {
        user_id: client_id,
        // don't hide deleted or private items.
      };
    }

    return this.prisma.orders.findMany(find_parameters);
  }

  async GetOrder(order_id: string, client_id: string) {
    // TODO A resolve field can take care of a lot of this include stuff
    const find_parameters = {
      include: {
        user: true,
        order_items: {
          include: { product_variation: true },
        },
      },
      where: {
        id: order_id,
        user_id: client_id,
        // don't hide deleted or private items.
      },
    };

    return this.prisma.orders.findUnique(find_parameters);
  }
}
