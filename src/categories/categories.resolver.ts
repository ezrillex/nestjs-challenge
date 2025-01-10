import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseUUIDPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Categories, GetCategoriesResponse } from './categories.model';
import { PublicPrivate } from '../common/decorators/public_and_private.decorator';
import { Products } from '../products/products.model';

@Resolver(() => GetCategoriesResponse)
export class CategoriesResolver {
  constructor(private categoriesService: CategoriesService) {}

  @RequiresRole(roles.manager)
  @Mutation(() => Categories, { nullable: true })
  async createCategory(@Args('name') name: string): Promise<Categories> {
    return this.categoriesService.CreateCategory(name);
  }

  @PublicPrivate()
  @Query(() => [GetCategoriesResponse], { nullable: true })
  async getCategories(): Promise<Categories[]> {
    return this.categoriesService.GetCategories();
  }

  @ResolveField()
  async products(@Parent() category: Categories): Promise<Products[]> {
    const { id } = category;
    return this.categoriesService.ResolveProductsOnCategories(id);
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async deleteCategory(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<string> {
    return this.categoriesService.DeleteCategory(id);
  }
}
