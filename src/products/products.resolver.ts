import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { roles } from '@prisma/client';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { CreateProductInput } from './inputs/createProduct.input';
import { ProductsService } from './products.service';
import { Products } from './products.model';
import { GetProductsInput } from './inputs/get-products.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { UpdateProductVariationInput } from './product_variation/update-product-variation.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { PublicPrivate } from '../common/decorators/public_and_private.decorator';
import { CreateProductVariationInput } from './product_variation/create_product_variation.input';

@Resolver()
export class ProductsResolver {
  constructor(private productsService: ProductsService) {}

  @PublicPrivate()
  @Query(() => [Products], { nullable: true })
  async getProducts(
    @Args('GetProductsInput') getProductsInput: GetProductsInput,
    @Context('req') request: Request,
  ) {
    // todo on auth guard we set a value to know what mode we are in...
    let role: roles = roles.public;
    if (request['user'] && request['user'].role) {
      role = request['user'].role;
    }
    return this.productsService.GetProducts(role, getProductsInput);
  }

  @PublicPrivate()
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
  async createProductVariation(
    @Args('CreateProductVariationInput')
    createProductVariationInput: CreateProductVariationInput,
    @Context('req') request: Request,
  ) {
    // todo check if product exists, or let it fail?

    const result = await this.productsService.CreateProductVariation(
      createProductVariationInput,
      request['user'].id,
    );
    return result.id;
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async deleteProductVariation(
    @Args('variation_id', { type: () => String }, ParseUUIDPipe)
    variation_id: string,
  ) {
    return this.productsService.DeleteProductVariation(variation_id);
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async deleteProduct(
    @Args('product_id', { type: () => String }, ParseUUIDPipe)
    product_id: string,
    @Context('req') request: Request,
  ) {
    // TODO because the db will cascade when we do the actual delete, we need to first delete the images from CDN.

    const result = await this.productsService.DeleteProduct(
      product_id,
      request['user'].id,
    );
    return result.id;
  }
}
