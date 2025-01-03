import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { roles } from '@prisma/client';
import { CreateProductInput } from './inputs/createProduct.input';
import { GetProductsInput } from './inputs/get-products.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { UpdateProductVariationInput } from './product_variation/update-product-variation.input';
import { CreateProductVariationInput } from './product_variation/create_product_variation.input';

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
          id: {
            in: params.categoryFilter,
          },
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
    // todo RBAC of queryable fields.
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

  async GetProductVariationById(id: string, count_only: boolean = false) {
    if (count_only) {
      return this.prisma.productVariations.count({
        where: { id: id },
      });
    } else {
      return this.prisma.productVariations.findUnique({
        include: {
          images: true,
        },
        where: { id: id },
      });
    }
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

  async CreateProductVariation(
    data: CreateProductVariationInput,
    userId: string,
  ) {
    // todo check if product exists, or let it fail?
    return this.prisma.productVariations.create({
      data: {
        product: { connect: { id: data.product_id } },
        price: data.price,
        stock: data.stock,
        title: data.title,
        last_updated_by: userId,
        last_updated_at: new Date().toISOString(),
      },
    });
  }

  async DeleteProductVariation(id: string) {
    const record = await this.prisma.productVariations.findUnique({
      where: { id: id },
      include: {
        product: true,
      },
    });

    if (!record) {
      throw new NotFoundException('Product Variation not found.');
    }

    // todo research how to get the count directly from query.
    const variations_of_product = await this.prisma.productVariations.findMany({
      where: { product_id: record.product_id },
    });

    if (variations_of_product.length === 1) {
      throw new BadRequestException(
        'Can not delete the product variation if it is the last one.',
      );
    }

    const result = await this.prisma.productVariations.delete({
      where: { id: id },
    });

    if (result) {
      return 'Product Variation deleted.';
    } else
      throw new InternalServerErrorException(
        'Something went wrong when deleting the product variation.',
      );
  }

  async DeleteProduct(product_id: string, user_id: string) {
    // TODO because the db will cascade when we do the actual delete, we need to first delete the images from CDN.

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
