import { Injectable } from '@nestjs/common';
import { CreateProductDto } from 'src/DTOs/create-product.dto/create-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Users } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async CreateProduct(data: CreateProductDto, user: Users) {
    // create variations

    // create the product
    this.prisma.products.create({
      data: {
        name: data.name,
        description: data.description,
        variations: ['todo'],
        created_by: user.id,
        created_at: new Date().toISOString(),
      },
    });
  }
}
