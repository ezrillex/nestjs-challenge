import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartItems } from './cart_items.model';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}
  async addToCart(
    variation_id: string,
    user_id: string,
    quantity: number,
  ): Promise<CartItems> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }
    const variation = await this.prisma.productVariations.count({
      where: {
        id: variation_id,
        product: {
          is_published: true,
          is_deleted: false,
        },
      },
    });
    if (!variation) {
      throw new BadRequestException('Product Variation not found!');
    }

    const record = await this.prisma.cartItems.findUnique({
      where: {
        user_id_product_variation_id: {
          product_variation_id: variation_id,
          user_id: user_id,
        },
      },
    });
    if (record) {
      return this.prisma.cartItems.update({
        where: { id: record.id },
        data: {
          quantity: quantity,
        },
      });
    } else {
      return this.prisma.cartItems.create({
        data: {
          cart_owner: {
            connect: { id: user_id },
          },
          product_variation: {
            connect: { id: variation_id },
          },
          quantity: quantity,
        },
      });
    }
  }

  async removeFromCart(
    product_variation_id: string,
    user_id: string,
  ): Promise<string> {
    const record = await this.prisma.cartItems.findUnique({
      where: {
        user_id_product_variation_id: {
          product_variation_id,
          user_id,
        },
      },
      select: {
        id: true,
      },
    });
    if (!record) {
      throw new BadRequestException('Cart Item not found!');
    }

    await this.prisma.cartItems.delete({
      where: { id: record.id },
    });
    return 'Cart Item deleted successfully.';
  }

  async getCartItems(user_id: string): Promise<CartItems[]> {
    return this.prisma.cartItems.findMany({
      where: {
        user_id: user_id,
        // hide deleted or private items.
        product_variation: {
          product: { is_deleted: false, is_published: true },
        },
      },
    });
  }
}
