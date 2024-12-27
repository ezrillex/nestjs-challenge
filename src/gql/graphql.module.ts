import { Module } from '@nestjs/common';
import { ProductsResolver } from './resolvers/products/products.resolver';
import { AuthModule } from '../modules/auth/auth.module';
import { ProductsModule } from '../modules/products/products.module';

@Module({
  providers: [ProductsResolver],
  imports: [AuthModule, ProductsModule],
})
export class GraphqlModule {}
