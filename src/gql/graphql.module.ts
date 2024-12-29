import { Module } from '@nestjs/common';
import { ProductsResolver } from './resolvers/products/products.resolver';
import { AuthModule } from '../modules/auth/auth.module';
import { ProductsModule } from '../modules/products/products.module';
import { CategoriesResolver } from './resolvers/categories/categories.resolver';
import { LikesResolver } from './resolvers/likes/likes.resolver';
import { CartItemsResolver } from './resolvers/cart_items/cart_items.resolver';
import { OrdersResolver } from './resolvers/orders/orders.resolver';

@Module({
  providers: [ProductsResolver, CategoriesResolver, LikesResolver, CartItemsResolver, OrdersResolver],
  imports: [AuthModule, ProductsModule],
})
export class GraphqlModule {}
