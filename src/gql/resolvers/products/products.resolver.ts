import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Public } from '../../../decorators/public/public.decorator';
import { roles } from '@prisma/client';
import { RequiresRole } from '../../../decorators/requires-role/requires-role.decorator';
import { CreateProductInput } from '../../models/products/createProduct.input';
import { ProductsService } from '../../../services/products/products.service';
import { Products } from '../../models/products/products.model';
import { GetProductsInput } from '../../models/products/get-products.input/get-products.input';
import { UpdateProductInput } from '../../models/products/product/update-product-input/update-product-input';
import { UpdateProductVariationInput } from '../../models/products/product/update-product-variation-input/update-product-variation-input';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver()
export class ProductsResolver {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Query(() => [Products], { nullable: true })
  async getProducts(
    @Args('GetProductsInput') getProductsInput: GetProductsInput,
    @Context('req') request: Request,
  ) {
    let role: roles = roles.public;
    if (request['user']) {
      role = request['user'].role;
    }
    return this.productsService.GetProducts(role, getProductsInput);
  }

  @Public()
  @Query(() => Products, { nullable: true })
  async getProductById(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Context('req') request: Request,
  ) {
    let role: roles = roles.public;
    if (request['user']) {
      role = request['user'].role;
    }
    return this.productsService.GetProductById(role, id);
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async createProduct(
    @Args('CreateProductInput') createProductInput: CreateProductInput,
    @Context('req') request: Request,
  ) {
    const result = await this.productsService.CreateProduct(
      createProductInput,
      request['user'].id,
    );
    return result.id;
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async updateProduct(
    @Args('UpdateProductInput') updateProductInput: UpdateProductInput,
    @Context('req') request: Request,
  ) {
    const result = await this.productsService.UpdateProduct(
      updateProductInput,
      request['user'].id,
    );
    return result.id;
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async updateProductVariation(
    @Args('UpdateProductVariationInput')
    updateProductVariationInput: UpdateProductVariationInput,
    @Context('req') request: Request,
  ) {
    const result = await this.productsService.UpdateProductVariation(
      updateProductVariationInput,
      request['user'].id,
    );
    return result.id;
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async deleteProduct(
    @Args('product_id', { type: () => String }, ParseUUIDPipe)
    product_id: string,
    @Context('req') request: Request,
  ) {
    // TODO because the db will cascade when we do the actual delete, we need to first delete the images fron CDN.

    const result = await this.productsService.DeleteProduct(
      product_id,
      request['user'].id,
    );
    return result.id;
  }
}
