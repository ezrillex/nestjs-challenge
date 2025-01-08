import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email: email },
    });
    if (user) {
      return user;
    } else {
      throw new HttpException(
        "Couldn't find your account. Make sure this is the right email.",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findOneByID(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: id },
    });
    if (user) {
      return user;
    } else {
      throw new HttpException(
        "Couldn't find an account with the associated id .",
        HttpStatus.NOT_FOUND,
      );
    }
  }

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
