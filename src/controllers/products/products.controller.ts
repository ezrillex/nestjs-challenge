import { Body, Controller, Get, Post } from '@nestjs/common';
import { PublicPrivate } from '../../decorators/public_and_private/public_and_private.decorator';
import { CreateProductDto } from '../../DTOs/create-product.dto/create-product.dto';
import { ProductsService } from '../../services/products/products.service';
import { Request } from '@nestjs/common';
import { RequiresRole } from '../../decorators/requires-role/requires-role.decorator';
import { roles } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @PublicPrivate()
  async getProducts() {
    return 'hello1!!!';
  }

  @Post()
  @RequiresRole(roles.manager)
  async createProduct(@Body() data: CreateProductDto, @Request() req: Request) {
    console.log(data);
    // await this.productsService.CreateProduct(data, req['user']);
  }
}
