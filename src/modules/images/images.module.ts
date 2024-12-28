import { Module } from '@nestjs/common';
import { ImagesController } from '../../controllers/images/images.controller';
import { ImagesService } from '../../services/images/images.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { ProductsService } from '../../services/products/products.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, PrismaService, ProductsService],
})
export class ImagesModule {}
