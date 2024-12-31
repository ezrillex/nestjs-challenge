import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesResolver } from './likes.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [LikesService, LikesResolver, PrismaService],
})
export class LikesModule {}
