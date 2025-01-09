import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Users } from './users.model';
import { PrismaService } from '../prisma/prisma.service';

@Resolver(() => Users)
export class UsersResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => Users)
  async user(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
  }

  @ResolveField()
  async likes_products(@Parent() users: Users) {
    const { id } = users;
    return this.prisma.likesOfProducts.findMany({
      where: {
        user_id: id,
      },
      include: {
        liked_by: {
          select: { id: true },
        },
        likes_product_variation: {
          select: { id: true },
        },
      },
    });
  }
}
