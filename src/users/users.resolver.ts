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
import { LikesOfProducts } from '../likes/LikesOfProducts.model';

@Resolver(() => Users)
export class UsersResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => Users)
  async user(@Args('id', { type: () => ID }) id: string): Promise<Users> {
    return this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
  }

  @ResolveField()
  async likes_products(@Parent() users: Users): Promise<LikesOfProducts[]> {
    const { id } = users;
    const data = await this.prisma.likesOfProducts.findMany({
      where: {
        user_id: id,
      },
    });

    return data.map((item) => {
      return { ...item, state: true };
    });
  }
}
