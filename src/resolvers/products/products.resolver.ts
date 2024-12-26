import {
  Args,
  Field,
  InputType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GetProductsInput } from '../../gql/graphql';

@Resolver()
export class ProductsResolver {
  @Query()
  async getPublicProducts(@Args() input: GetProductsInput) {
    console.log(input);
    return { id: 123, name: 'iphone 178 pro maxxed' };
  }

  @ResolveField()
  async name(@Parent() getPublicProducts) {
    console.log(getPublicProducts);
    return getPublicProducts.name;
  }
}
