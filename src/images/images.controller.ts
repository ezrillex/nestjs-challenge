import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { CreateImageDto } from './create-image-dto';
import { ImagesService } from './images.service';
import { ProductsService } from '../products/products.service';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly imageService: ImagesService,
    private readonly productService: ProductsService,
  ) {}

  @RequiresRole(roles.manager)
  @Post()
  async createImage(@Body() data: CreateImageDto) {
    if (!data.image_mime_type.startsWith('image/')) {
      throw new BadRequestException('Image must have a valid image mime type');
    }

    const record = await this.productService.GetProductVariationById(
      data.product_variation_id,
    );

    if (!record) {
      throw new NotFoundException('Product Variation not found');
    }

    return this.imageService.uploadImage(
      data.image,
      data.image_mime_type,
      data.product_variation_id,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresRole(roles.manager)
  @Delete(':id')
  async deleteImage(@Param('id', ParseUUIDPipe) id: string) {
    // No return due to delete being no content by design.
    await this.imageService.deleteImageById(id);
  }
}
