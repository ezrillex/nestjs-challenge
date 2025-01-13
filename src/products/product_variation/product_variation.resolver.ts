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
import { ImagesService } from '../../images/images.service';
import { Images } from '../../images/images.model';

@Resolver(() => ProductVariations)
export class ProductVariationResolver {
  constructor(
    private productsService: ProductsService,
    private readonly imagesService: ImagesService,
  ) {}

  @RequiresRole(roles.manager)
  @Mutation(() => ProductVariations, { nullable: true })
  async updateProductVariation(
    @Args('UpdateProductVariationInput')
    updateProductVariationInput: UpdateProductVariationInput,
    @Context('req') request: Request,
  ): Promise<ProductVariations> {
    return await this.productsService.UpdateProductVariation(
      updateProductVariationInput,
      request['user'].id,
    );
  }

  @RequiresRole(roles.manager)
  @Mutation(() => ProductVariations, { nullable: true })
  async createProductVariation(
    @Args('CreateProductVariationInput')
    createProductVariationInput: CreateProductVariationInput,
    @Context('req') request: Request,
  ): Promise<ProductVariations> {
    return await this.productsService.CreateProductVariation(
      createProductVariationInput,
      request['user'].id,
    );
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async deleteProductVariation(
    @Args('variation_id', { type: () => String }, ParseUUIDPipe)
    variation_id: string,
  ): Promise<string> {
    return this.productsService.DeleteProductVariation(variation_id);
  }

  @ResolveField()
  async images(
    @Parent() product_variation: ProductVariations,
  ): Promise<Images[]> {
    const { id } = product_variation;
    return await this.imagesService.getImagesByProductVariation(id);
  }
}
