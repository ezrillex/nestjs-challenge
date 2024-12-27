import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { roles } from '@prisma/client';
import { CreateProductInput } from '../../gql/models/products/createProduct.input';
import { GetProductsInput } from '../../gql/models/products/get-products.input/get-products.input';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async CreateProduct(data: CreateProductInput, userId: string) {
    return this.prisma.products.create({
      data: {
        name: data.name,
        description: data.description,
        variations: {
          createMany: {
            data: data.variations,
          },
        },
        created_by: userId,
        created_at: new Date().toISOString(),
      },
    });
  }

  async GetProducts(role: roles, params: GetProductsInput) {
    const filter = {};
    const pagination = { skip: 0, take: 10 };

    if (params.first) {
      pagination.take = params.first;
    }

    if (params.offset) {
      pagination.skip = params.offset;
    }

    if (params.categoryFilter && params.categoryFilter.length > 0) {
      filter['categories'] = { hasEvery: params.categoryFilter };
    }

    if (role === roles.manager) {
      filter['is_deleted'] = false;
    } else {
      // public role
      filter['is_published'] = true;
      filter['is_deleted'] = false;
    }

    if (params.likedOnly && role === roles.customer) {
      // todo filter by liked for customers.
    }

    if (params.search && params.search.length > 0) {
      filter['name'] = { contains: params.search };
    }
    console.log({ filter, pagination });
    return this.prisma.products.findMany({
      include: {
        variations: {
          include: { images: true },
        },
      },
      where: filter,
      ...pagination,
    });
  }
}
