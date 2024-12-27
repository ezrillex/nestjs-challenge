import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsService } from '../../services/products/products.service';
import { PrismaService } from '../../services/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  providers: [ProductsService, PrismaService],
  exports: [ProductsService],
})
export class ProductsModule {}
