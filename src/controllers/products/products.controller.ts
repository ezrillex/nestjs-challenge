import { Controller, Get } from '@nestjs/common';
import { PublicPrivate } from '../../decorators/public_and_private/public_and_private.decorator';

@Controller('products')
export class ProductsController {
  @Get()
  @PublicPrivate()
  async getProducts() {
    return 'hello1!!!';
  }
}
