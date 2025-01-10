import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Categories, ProductVariations, roles } from '@prisma/client';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { CreateProductInput } from './inputs/createProduct.input';
import { ProductsService } from './products.service';
import { Products } from './products.model';
import { GetProductsInput } from './inputs/get-products.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { PublicPrivate } from '../common/decorators/public_and_private.decorator';
import { CategoriesService } from '../categories/categories.service';

@Resolver(() => Products)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @PublicPrivate()
  @Query(() => [Products], { nullable: true })
  async getProducts(
    @Args('GetProductsInput') getProductsInput: GetProductsInput,
    @Context('req') request: Request,
  ): Promise<Products[]> {
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
  ): Promise<Products> {
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
  ): Promise<Products> {
    return await this.productsService.CreateProduct(
      createProductInput,
      request['user'].id,
    );
  }

  @RequiresRole(roles.manager)
  @Mutation(() => Products, { nullable: true })
  async updateProduct(
    @Args('UpdateProductInput') updateProductInput: UpdateProductInput,
    @Context('req') request: Request,
  ): Promise<Products> {
    return await this.productsService.UpdateProduct(
      updateProductInput,
      request['user'].id,
    );
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async deleteProduct(
    @Args('product_id', { type: () => String }, ParseUUIDPipe)
    product_id: string,
    @Context('req') request: Request,
  ): Promise<string> {
    await this.productsService.DeleteProduct(product_id, request['user'].id);
    return 'Product successfully deleted!';
  }

  @ResolveField()
  async variations(@Parent() product: Products): Promise<ProductVariations[]> {
    const { id } = product;
    return this.productsService.ResolveProductVariations(id);
  }

  @ResolveField()
  async categories(@Parent() product: Products): Promise<Categories[]> {
    const { id } = product;
    return this.categoriesService.ResolveCategories(id);
  }
}
