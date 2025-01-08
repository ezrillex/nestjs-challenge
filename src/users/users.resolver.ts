import { Args, ID, Query, Resolver } from '@nestjs/graphql';
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
}
