import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { OrderItems } from './order_items.model';
import { ProductsService } from '../../products/products.service';
import { ProductVariations } from '../../products/product_variation/product-variations.model';

@Resolver(() => OrderItems)
export class OrderItemsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @ResolveField()
  async product_variation(
    @Parent() order_items: OrderItems,
  ): Promise<ProductVariations | null> {
    const { id } = order_items;
    return this.productsService.ResolveProductVariationOnOrderItems(id);
  }
}
