import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ProductVariations } from '../../products/product_variation/product-variations.model';
import { GraphQLFloat } from 'graphql/type';
import { Decimal } from '@prisma/client/runtime/library';

@ObjectType()
export class OrderItems {
  @Field(() => ID)
  id: string;

  // circular reference issue. omitting orders field.
  // @Field(() => Orders, { nullable: true })
  // order: Orders;

  // it CAN be null because if its deleted we cant return it.
  @Field(() => ProductVariations, { nullable: true })
  product_variation?: ProductVariations;

  @Field(() => Int)
  quantity: number;

  @Field(() => GraphQLFloat)
  price_purchased_at: Decimal;
}
