import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { Images } from './images.model';

@Injectable()
export class ImagesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {
    cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    imageBase64: string,
    mime_type: string,
    product_variation_id: string,
  ) {
    if (!mime_type.startsWith('image/')) {
      throw new BadRequestException('Image must have a valid image mime type');
    }

    const record = await this.productsService.GetProductVariationById(
      product_variation_id,
      true,
    );
    if (record === 0) {
      throw new NotFoundException('Product Variation not found');
    }

    const image = await cloudinary.uploader.upload(
      `data:${mime_type};base64,${imageBase64}`,
    );
    if (!image.public_id) {
      throw new InternalServerErrorException(
        'There was an issue with the CDN, please try again later.',
      );
    }

    return this.prisma.images.create({
      select: {
        id: true,
        url: true,
      },
      data: {
        cdn_id: image.public_id,
        url: image.secure_url,
        created_at: new Date().toISOString(),
        product_variation: {
          connect: { id: product_variation_id },
        },
      },
    });
  }

  async deleteImageById(id: string) {
    const record = await this.prisma.images.findUnique({
      where: { id: id },
    });
    if (!record) {
      throw new NotFoundException('Image not found');
    }

    const cdn_response = await cloudinary.uploader.destroy(record.cdn_id);

    if (cdn_response && cdn_response.result && cdn_response.result === 'ok') {
      return this.prisma.images.delete({
        where: { id: record.id },
      });
    } else {
      throw new InternalServerErrorException(
        `An error occurred when deleting the image.`,
      );
    }
  }

  async ResolveImagesField(product_variation_id: string): Promise<Images[]> {
    const { images } = await this.prisma.productVariations.findUnique({
      where: { id: product_variation_id },
      select: {
        images: true,
      },
    });
    return images;
  }
}
