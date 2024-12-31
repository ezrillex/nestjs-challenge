import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { roles } from '@prisma/client';
import { ParseUUIDPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Resolver()
export class CategoriesResolver {
  constructor(private categoriesService: CategoriesService) {}

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async createCategory(@Args('name') name: string) {
    const result = await this.categoriesService.CreateCategory(name);
    return result.id;
  }

  @RequiresRole(roles.manager)
  @Mutation(() => String, { nullable: true })
  async deleteCategory(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.DeleteCategory(id);
  }
}
