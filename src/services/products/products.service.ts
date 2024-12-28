import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { roles } from '@prisma/client';
import { CreateProductInput } from '../../gql/models/products/createProduct.input';
import { GetProductsInput } from '../../gql/models/products/get-products.input/get-products.input';
import { CreateCategoryInput } from '../../gql/models/products/create-category-input/create-category-input';
import { UpdateProductInput } from '../../gql/models/products/product/update-product-input/update-product-input';
import { UpdateProductVariationInput } from '../../gql/models/products/product/update-product-variation-input/update-product-variation-input';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async CreateProduct(data: CreateProductInput, userId: string) {
    return this.prisma.products.create({
      data: {
        name: data.name,
        description: data.description,
        categories: {
          connect: data.categories.map((id) => ({ id: id })),
        },
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

  async UpdateProduct(data: UpdateProductInput, userId: string) {
    // todo you could in theory update a deleted product if you have the uuid...

    if (
      !(data.name || data.description || data.categories || data.is_published)
    ) {
      throw new BadRequestException(
        'At least one property is required for update!',
      );
    }

    const toUpdate = {};
    if (data.name) {
      toUpdate['name'] = data.name;
    }
    if (data.description) {
      toUpdate['description'] = data.description;
    }
    if (data.categories) {
      toUpdate['categories'] = {
        set: data.categories.map((id) => ({ id: id })),
      };
    }
    if (data.is_published) {
      toUpdate['is_published'] = data.is_published;
    }

    return this.prisma.products.update({
      where: { id: data.id },
      data: {
        ...toUpdate,
        last_updated_by: userId,
        last_updated_at: new Date().toISOString(),
      },
    });
  }

  async CreateCategory(data: CreateCategoryInput) {
    // todo format when duplicate error.
    return this.prisma.categories.create({
      data: {
        name: data.name,
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
      filter['categories'] = {
        some: {
          id: '54a4e78e-53c7-4bbf-860e-232c2fd2c0c0',
        },
      };
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
    //console.log({ filter, pagination });
    // todo so maybe do some role based controls for what can the user get in return?
    // how should I go about implementing this?, maybe a select with different set for different roles?
    return this.prisma.products.findMany({
      include: {
        variations: {
          include: { images: true },
        },
        categories: true,
      },
      where: filter,
      ...pagination,
    });
  }

  async GetProductById(role: roles, id: string) {
    const filter = { id: id };

    if (role === roles.manager) {
      filter['is_deleted'] = false;
    } else {
      // public role
      filter['is_published'] = true;
      filter['is_deleted'] = false;
    }

    return this.prisma.products.findUnique({
      include: {
        variations: {
          include: { images: true },
        },
        categories: true,
      },
      where: filter,
    });
  }

  async GetProductVariationById(id: string) {
    const filter = { id: id };

    return this.prisma.productVariations.findUnique({
      include: {
        images: true,
      },
      where: filter,
    });
  }

  async UpdateProductVariation(
    data: UpdateProductVariationInput,
    userId: string,
  ) {
    // todo you could in theory update a deleted product variation if you have the uuid...
    if (!(data.title || data.stock || data.price)) {
      throw new BadRequestException('Must have at least one field to update!');
    }

    const toUpdate = {};
    if (data.title) {
      toUpdate['title'] = data.title;
    }
    if (data.price) {
      toUpdate['price'] = data.price;
    }
    if (data.stock) {
      toUpdate['stock'] = data.stock;
    }

    return this.prisma.productVariations.update({
      where: { id: data.id },
      data: {
        ...toUpdate,
        last_updated_by: userId,
        last_updated_at: new Date().toISOString(),
      },
    });
  }

  async DeleteProduct(product_id: string, user_id: string) {
    return this.prisma.products.update({
      where: { id: product_id },
      data: {
        is_deleted: true,
        last_updated_by: user_id,
        last_updated_at: new Date().toISOString(),
      },
    });
  }
}
