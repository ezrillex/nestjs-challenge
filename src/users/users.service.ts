import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async ResolveUsersOnCartItemsField(id: string) {
    return this.prisma.cartItems.findUnique({
      where: {
        id: id,
      },
      select: {
        cart_owner: true,
      },
    });
  }

  async ResolveUsersOnOrdersField(id: string) {
    return this.prisma.orders.findUnique({
      where: {
        id: id,
      },
      select: {
        user: true,
      },
    });
  }

  async ResolveUsersOnLikesOfProductsField(id: string) {
    return this.prisma.likesOfProducts.findUnique({
      where: {
        id: id,
      },
      select: {
        liked_by: true,
      },
    });
  }
}
