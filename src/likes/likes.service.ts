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
      return 'Deleted like successfully.';
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
}
