import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Products, ProductVariations, roles } from '@prisma/client';
import { CreateProductInput } from './inputs/createProduct.input';
import { GetProductsInput } from './inputs/get-products.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { UpdateProductVariationInput } from './product_variation/inputs/update-product-variation.input';
import { CreateProductVariationInput } from './product_variation/inputs/create_product_variation.input';
import { DateTime } from 'luxon';
import { Images } from '../images/images.model';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async ResolveProductVariationOnCartItems(
    id: string,
  ): Promise<ProductVariations> {
    const { product_variation } = await this.prisma.cartItems.findUnique({
      where: { id: id },
      select: {
        product_variation: true,
      },
    });
    return product_variation;
  }

  async ResolveProductVariationOnOrderItems(
    id: string,
  ): Promise<ProductVariations> {
    const { product_variation } = await this.prisma.orderItems.findUnique({
      where: { id: id },
      select: {
        product_variation: true,
      },
    });
    return product_variation;
  }

  async ResolveProductVariations(id: string): Promise<ProductVariations[]> {
    const { variations } = await this.prisma.products.findUnique({
      where: { id: id },
      select: {
        variations: true,
      },
    });
    return variations;
  }

  async CreateProduct(
    data: CreateProductInput,
    userId: string,
  ): Promise<Products> {
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

  async UpdateProduct(
    data: UpdateProductInput,
    userId: string,
  ): Promise<Products> {
    // todo you could in theory update a deleted product if you have the uuid...
    const countProducts = await this.prisma.products.count({
      where: { id: data.id },
    });
    if (countProducts === 0) {
      throw new NotFoundException('Product not found.');
    }

    // assume user id is correct due to guard. no checks.

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

  async GetProducts(
    role: roles,
    params: GetProductsInput,
  ): Promise<Products[]> {
    const filter = {};
    const pagination = { skip: 0, take: 10 };

    if (params.first && params.first > 0) {
      pagination.take = params.first;
    }

    if (params.offset && params.offset > 0) {
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

    // if (params.likedOnly && role === roles.customer) {
    //   // todo filter by liked for customers.
    // }

    if (params.search && params.search.length > 0) {
      filter['name'] = { contains: params.search };
    }
    // todo should we do RBAC of queryable fields? like a select for one and a select for the other
    return this.prisma.products.findMany({
      where: filter,
      ...pagination,
    });
  }

  async GetProductById(role: roles, id: string): Promise<Products> {
    const filter = { id: id };

    if (role === roles.manager) {
      filter['is_deleted'] = false;
    } else {
      // public role
      filter['is_published'] = true;
      filter['is_deleted'] = false;
    }
    const result = await this.prisma.products.findUnique({
      where: filter,
    });
    if (!result) {
      throw new NotFoundException('Product not found.');
    }
    return result;
  }

  async GetProductVariationById(
    id: string,
    count_only: boolean = false,
  ): Promise<ProductVariations | number> {
    if (count_only) {
      return this.prisma.productVariations.count({
        where: { id: id },
      });
    } else {
      const result = this.prisma.productVariations.findUnique({
        include: {
          images: true,
        },
        where: { id: id },
      });

      if (!result) {
        throw new NotFoundException('Product Variation not found.');
      } else {
        return result;
      }
    }
  }

  async UpdateProductVariation(
    data: UpdateProductVariationInput,
    userId: string,
  ): Promise<ProductVariations> {
    // todo you could in theory update a deleted product variation if you have the uuid...
    const count = await this.prisma.productVariations.count({
      where: { id: data.id },
    });
    if (count === 0) {
      throw new NotFoundException('Product Variation not found.');
    }

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
  ): Promise<ProductVariations> {
    const count = await this.prisma.products.count({
      where: { id: data.product_id },
    });
    if (count === 0) {
      throw new NotFoundException('Product not found.');
    }
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

  // todo future refactor, dont actually delete the variations.
  async DeleteProductVariation(id: string): Promise<string> {
    const record = await this.prisma.productVariations.findUnique({
      where: { id: id },
      select: {
        product: {
          select: {
            _count: {
              select: {
                variations: true,
              },
            },
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Product Variation not found.');
    }

    if (record.product._count.variations === 1) {
      throw new BadRequestException(
        'Can not delete the product variation if it is the last one.',
      );
    }

    await this.prisma.productVariations.delete({
      where: { id: id },
    });
    return 'Product Variation deleted.';
  }

  async DeleteProduct(product_id: string, user_id: string): Promise<Products> {
    const count = await this.prisma.products.count({
      where: { id: product_id },
    });
    if (!count) {
      throw new NotFoundException('Product not found.');
    }

    return this.prisma.products.update({
      where: { id: product_id },
      data: {
        is_deleted: true,
        last_updated_by: user_id,
        last_updated_at: new Date().toISOString(),
      },
    });
  }

  // todo figure out how to check if already purchased
  // once we do handle stock it could be done by doing more queries but since we
  // do multiple products at once we are too nested to do such a thing.
  async GetLowStockProducts(): Promise<
    (ProductVariations & { images: Images[] })[]
  > {
    const twoDaysAgo = DateTime.now().minus({ days: 2 });

    return this.prisma.productVariations.findMany({
      include: {
        images: true,
        LikesOfProducts: {
          where: {
            created_at: {
              gte: twoDaysAgo.toISO(),
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        },
      },
      where: {
        stock: {
          lte: 3,
        },
        LikesOfProducts: {
          some: {},
        },
      },
    });
  }
}
