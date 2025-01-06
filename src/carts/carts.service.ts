import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}
  async AddToCart(variation_id: string, user_id: string, quantity: number) {
    const variation = await this.prisma.productVariations.count({
      where: { id: variation_id },
    });
    if (variation === 0) {
      throw new BadRequestException('Product Variation not found!');
    }

    const record = await this.prisma.cartItems.findFirst({
      where: {
        product_variation_id: variation_id,
        user_id: user_id,
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

  async RemoveCartItem(cart_id: string) {
    const record = await this.prisma.cartItems.count({
      where: { id: cart_id },
    });
    if (record === 0) {
      throw new BadRequestException('Cart Item not found!');
    }

    const result = await this.prisma.cartItems.delete({
      where: { id: cart_id },
    });

    if (result) {
      return 'Cart Item deleted successfully.';
    } else {
      throw new BadRequestException('Unexpected error when deleting record!');
    }
  }

  async GetCartItems(user_id: string) {
    // TODO A resolve field can take care of a lot of this include stuff
    return this.prisma.cartItems.findMany({
      include: {
        cart_owner: {
          include: {
            CartItems: {
              include: {
                product_variation: true,
              },
            },
            likes_products: {
              include: {
                likes_product_variation: true,
              },
            },
          },
        },
        product_variation: {
          include: { images: true },
        },
      },
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
