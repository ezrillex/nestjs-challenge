import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { roles } from '@prisma/client';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { CreateProductInput } from './inputs/createProduct.input';
import { ProductsService } from './products.service';
import { Products } from './products.model';
import { GetProductsInput } from './inputs/get-products.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { PublicPrivate } from '../common/decorators/public_and_private.decorator';

@Resolver(() => Products)
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
    // todo on auth guard we set a value to know what mode we are in...
    let role: roles = roles.public;
    if (request['user'] && request['user'].role) {
      role = request['user'].role;
    }
    return this.productsService.GetProductById(role, id);
  }

  @RequiresRole(roles.manager)
  @Mutation(() => Products, { nullable: true })
  async createProduct(
    @Args('CreateProductInput') createProductInput: CreateProductInput,
    @Context('req') request: Request,
  ) {
    const result = await this.productsService.CreateProduct(
      createProductInput,
      request['user'].id,
    );
    return result;
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
  async deleteProduct(
    @Args('product_id', { type: () => String }, ParseUUIDPipe)
    product_id: string,
    @Context('req') request: Request,
  ) {
    const result = await this.productsService.DeleteProduct(
      product_id,
      request['user'].id,
    );
    return result.id;
  }
}
