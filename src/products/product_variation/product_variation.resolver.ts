import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ProductVariations } from './product-variations.model';
import { ProductsService } from '../products.service';
import { RequiresRole } from '../../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { UpdateProductVariationInput } from './inputs/update-product-variation.input';
import { CreateProductVariationInput } from './inputs/create_product_variation.input';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver(() => ProductVariations)
export class ProductVariationResolver {
  constructor(private productsService: ProductsService) {}

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

  @ResolveField()
  async images(@Parent() product_variation: ProductVariations) {
    const { id } = product_variation;
    const { images } = await this.productsService.ResolveImagesField(id);
    return images;
  }
}
