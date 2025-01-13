import {
  Args,
  Context,
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
    return this.categoriesService.createCategory(name);
  }

  @PublicPrivate()
  @Query(() => [GetCategoriesResponse], { nullable: true })
  async getCategories(): Promise<Categories[]> {
    return this.categoriesService.getAllCategories();
  }

  @ResolveField()
  async products(
    @Parent() category: Categories,
    @Context('req') request: Request,
  ): Promise<Products[]> {
    const { id } = category;
    return this.categoriesService.getProductsByCategory(
      id,
      request['user'].role,
    );
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async deleteCategory(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<string> {
    return this.categoriesService.deleteCategoryById(id);
  }
}
