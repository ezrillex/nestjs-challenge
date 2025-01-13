import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LikesOfProducts } from './LikesOfProducts.model';
import { ProductVariations } from '../products/product_variation/product-variations.model';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleLike(
    variation_id: string,
    user_id: string,
  ): Promise<LikesOfProducts> {
    const variation = await this.prisma.productVariations.count({
      where: {
        id: variation_id,
        product: {
          is_published: true,
          is_deleted: false,
        },
      },
    });
    if (variation === 0) {
      throw new BadRequestException('Product Variation not found!');
    }

    const where = {
      user_id: user_id,
      product_variation_id: variation_id,
    };

    const like = await this.prisma.likesOfProducts.count({
      where: where,
    });

    if (like > 0) {
      const data = await this.prisma.likesOfProducts.delete({
        where: {
          user_id_product_variation_id: where,
        },
      });
      return {
        state: false,
        ...data,
      };
    } else {
      const data = await this.prisma.likesOfProducts.create({
        data: {
          user_id: user_id,
          product_variation_id: variation_id,
        },
      });
      return {
        state: true,
        ...data,
      };
    }
  }

  async getLikes(user_id: string): Promise<ProductVariations[]> {
    const likes = await this.prisma.likesOfProducts.findMany({
      where: {
        user_id: user_id,
        likes_product_variation: {
          product: {
            is_published: true,
            is_deleted: false,
          },
        },
      },
      select: {
        likes_product_variation: true,
      },
    });
    return likes.map((like) => like.likes_product_variation);
  }
}
