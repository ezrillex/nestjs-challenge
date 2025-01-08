import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}
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
    const record = await this.prisma.likesOfProducts.count({
      where: { id: like_id },
    });
    if (record === 0) {
      throw new BadRequestException('Like not found!');
    }

    const result = await this.prisma.likesOfProducts.delete({
      where: { id: like_id },
    });

    return {
      result: 'Like removed successfully',
      ...result,
    };
  }

  async GetLikes(user_id: string) {
    return this.prisma.likesOfProducts.findMany({
      where: { user_id: user_id },
    });
  }
}
