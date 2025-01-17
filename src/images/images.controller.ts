import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { CreateImageDto } from './create-image.dto';
import { ImagesService } from './images.service';
import { Images } from './images.model';

@Controller('images')
export class ImagesController {
  constructor(private readonly imageService: ImagesService) {}

  @RequiresRole(roles.manager)
  @Post()
  async createImage(@Body() data: CreateImageDto): Promise<Images> {
    return this.imageService.uploadImage(
      data.image,
      data.image_mime_type,
      data.product_variation_id,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @RequiresRole(roles.manager)
  @Delete(':id')
  async deleteImage(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.imageService.deleteImageById(id);
  }
}
