import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Users } from './users.model';

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

  async ResolveUsersOnCartItemsField(id: string): Promise<Users> {
    const { cart_owner } = await this.prisma.cartItems.findUnique({
      where: {
        id: id,
      },
      select: {
        cart_owner: true,
      },
    });
    return cart_owner;
  }

  async ResolveUsersOnOrdersField(id: string): Promise<Users> {
    const { user } = await this.prisma.orders.findUnique({
      where: {
        id: id,
      },
      select: {
        user: true,
      },
    });
    return user;
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

  async ResolveUser(id: string) {
    return this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
  }
}
