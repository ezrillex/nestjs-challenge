import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { roles } from '@prisma/client';
import { CreateProductInput } from '../../gql/models/products/createProduct.input';
import { GetProductsInput } from '../../gql/models/products/get-products.input/get-products.input';
import { CreateCategoryInput } from '../../gql/models/products/create-category-input/create-category-input';
import { UpdateProductInput } from '../../gql/models/products/product/update-product-input/update-product-input';
import { UpdateProductVariationInput } from '../../gql/models/products/product/update-product-variation-input/update-product-variation-input';
import { CreateProductVariationInput } from '../../gql/models/products/product-variations/create-product-variation-input';

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
  async DeleteCategory(id: string) {
    const record = await this.prisma.categories.findUnique({
      where: { id: id },
    });

    if (!record) {
      throw new NotFoundException('Record not found.');
    }

    const result = await this.prisma.categories.delete({
      where: {
        id: id,
      },
    });

    if (result) {
      return 'Record Deleted';
    } else {
      throw new InternalServerErrorException(
        'An error occurred when deleting the category.',
      );
    }
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
          id: params.categoryFilter,
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

  async CreateProductVariation(
    data: CreateProductVariationInput,
    userId: string,
  ) {
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

  async LikeProduct(variation_id: string, user_id: string) {
    const variation = await this.prisma.productVariations.findUnique({
      where: { id: variation_id },
    });
    if (!variation) {
      throw new BadRequestException('Product Variation not found!');
    }

    const record = await this.prisma.likesOfProducts.findFirst({
      where: {
        product_variation_id: variation_id,
        user_id: user_id,
      },
    });
    if (record) {
      throw new BadRequestException(
        'Product variation is already liked by the User!',
      );
    }

    return this.prisma.likesOfProducts.create({
      data: {
        liked_by: {
          connect: { id: user_id },
        },
        likes_product_variation: {
          connect: { id: variation_id },
        },
      },
    });
  }

  async RemoveLike(like_id: string) {
    const record = await this.prisma.likesOfProducts.findUnique({
      where: { id: like_id },
    });
    if (!record) {
      throw new BadRequestException('Like not found!');
    }

    const result = await this.prisma.likesOfProducts.delete({
      where: { id: like_id },
    });

    if (result) {
      return 'Deleted like succesfully.';
    } else {
      throw new BadRequestException('Unexpected error when deleting record!');
    }
  }

  async GetLikes(user_id: string) {
    // TODO A resolve field can take care of a lot of this include stuff
    return this.prisma.likesOfProducts.findMany({
      include: {
        liked_by: {
          include: {
            likes_products: {
              include: {
                likes_product_variation: true,
              },
            },
          },
        },
        likes_product_variation: {
          include: { images: true },
        },
      },
      where: { user_id: user_id },
    });
  }

  // todo refactor into own service
  async AddToCart(variation_id: string, user_id: string, quantity: number) {
    const variation = await this.prisma.productVariations.findUnique({
      where: { id: variation_id },
    });
    if (!variation) {
      throw new BadRequestException('Product Variation not found!');
    }

    const record = await this.prisma.cartItems.findFirst({
      where: {
        product_variation_id: variation_id,
        user_id: user_id,
      },
    });
    if (record) {
      return this.prisma.cartItems.update({
        where: { id: record.id },
        data: {
          quantity: quantity,
        },
      });
    } else {
      return this.prisma.cartItems.create({
        data: {
          cart_owner: {
            connect: { id: user_id },
          },
          product_variation: {
            connect: { id: variation_id },
          },
          quantity: quantity,
        },
      });
    }
  }

  async RemoveCartItem(cart_id: string) {
    const record = await this.prisma.cartItems.findUnique({
      where: { id: cart_id },
    });
    if (!record) {
      throw new BadRequestException('Cart Item not found!');
    }

    const result = await this.prisma.cartItems.delete({
      where: { id: cart_id },
    });

    if (result) {
      return 'Cart Item deleted succesfully.';
    } else {
      throw new BadRequestException('Unexpected error when deleting record!');
    }
  }

  async GetCartItems(user_id: string) {
    // TODO A resolve field can take care of a lot of this include stuff
    return this.prisma.cartItems.findMany({
      include: {
        cart_owner: {
          include: {
            CartItems: {
              include: {
                product_variation: true,
              },
            },
            likes_products: {
              include: {
                likes_product_variation: true,
              },
            },
          },
        },
        product_variation: {
          include: { images: true },
        },
      },
      where: {
        user_id: user_id,
        // hide deleted or private items.
        product_variation: {
          product: { is_deleted: false, is_published: true },
        },
      },
    });
  }

  // todo refactor into own service
  async CreateOrder(user_id: string) {
    const cart_items = await this.prisma.cartItems.findMany({
      include: { product_variation: true },
      where: {
        user_id: user_id,
        product_variation: {
          product: { is_deleted: false, is_published: true },
        },
      },
    });
    if (cart_items.length === 0) {
      throw new BadRequestException('User has no items in cart!');
    }

    const order_items = cart_items.map((item) => ({
      quantity: item.quantity,
      product_variation_id: item.product_variation_id,
      price_purchased_at: item.product_variation.price,
    }));

    const order_result = await this.prisma.orders.create({
      include: {
        order_items: true,
        user: true,
      },
      data: {
        user: {
          connect: { id: user_id },
        },
        order_items: {
          createMany: {
            data: order_items,
          },
        },
      },
    });
    if (!order_result) {
      throw new InternalServerErrorException(
        'An error occurred when creating the order!',
      );
    }
    const cart_ids = cart_items.map((item) => item.id);
    const delete_result = await this.prisma.cartItems.deleteMany({
      where: {
        id: {
          in: cart_ids,
        },
      },
    });
    if (delete_result.count === 0) {
      throw new InternalServerErrorException('An unexpected error ocurred!');
    } else {
      return order_result.id;
    }
  }

  async GetOrders(user_id: string, role: roles, client_id: string = null) {
    // TODO A resolve field can take care of a lot of this include stuff
    const find_parameters = {
      include: {
        user: true,
        order_items: {
          include: { product_variation: true },
        },
      },
    };

    if (role === roles.customer) {
      find_parameters['where'] = {
        user_id: user_id,
        // don't hide deleted or private items.
      };
    } else if (role === roles.manager && client_id) {
      find_parameters['where'] = {
        user_id: client_id,
        // don't hide deleted or private items.
      };
    }

    return this.prisma.orders.findMany(find_parameters);
  }

  async GetOrder(order_id: string, client_id: string) {
    // TODO A resolve field can take care of a lot of this include stuff
    const find_parameters = {
      include: {
        user: true,
        order_items: {
          include: { product_variation: true },
        },
      },
      where: {
        id: order_id,
        user_id: client_id,
        // don't hide deleted or private items.
      },
    };

    return this.prisma.orders.findUnique(find_parameters);
  }
}
