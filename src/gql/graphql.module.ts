import { Module } from '@nestjs/common';
import { ProductsResolver } from './resolvers/products/products.resolver';
import { AuthModule } from '../modules/auth/auth.module';
import { ProductsModule } from '../modules/products/products.module';
import { CategoriesResolver } from './resolvers/categories/categories.resolver';
import { LikesResolver } from './resolvers/likes/likes.resolver';
import { CartItemsResolver } from './resolvers/cart_items/cart_items.resolver';

@Module({
  providers: [ProductsResolver, CategoriesResolver, LikesResolver, CartItemsResolver],
  imports: [AuthModule, ProductsModule],
})
export class GraphqlModule {}
