import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RequiresRole } from '../../../decorators/requires-role/requires-role.decorator';
import { roles } from '@prisma/client';
import { CreateCategoryInput } from '../../models/products/create-category-input/create-category-input';
import { ProductsService } from '../../../services/products/products.service';

@Resolver()
export class CategoriesResolver {
  // todo refactor this to be its own service? its too small tbh not want to do it as it bloats the app?
  constructor(private productsService: ProductsService) {}

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async createCategory(
    @Args('CreateCategoryInput') createCategoryInput: CreateCategoryInput,
  ) {
    const result =
      await this.productsService.CreateCategory(createCategoryInput);
    return result.id;
  }
}
