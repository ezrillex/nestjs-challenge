import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { OrderItems } from '../order_items.model';
import { ProductsService } from '../../products/products.service';

@Resolver(() => OrderItems)
export class OrderItemsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @ResolveField()
  async product_variation(@Parent() order_items: OrderItems) {
    const { id } = order_items;
    const { product_variation } =
      await this.productsService.ResolveProductVariationsOnOrderItemsField(id);
    return product_variation;
  }
}
