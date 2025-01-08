import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesResolver } from './likes.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [
    LikesService,
    LikesResolver,
    PrismaService,
    ProductsService,
    UsersService,
  ],
})
export class LikesModule {}
