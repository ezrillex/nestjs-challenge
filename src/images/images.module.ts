import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, PrismaService, ProductsService],
})
export class ImagesModule {}
