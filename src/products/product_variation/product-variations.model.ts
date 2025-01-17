import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Images } from '../../images/images.model';
import { Decimal } from '@prisma/client/runtime/library';
import { GraphQLFloat } from 'graphql/type';

@ObjectType()
export class ProductVariations {
  @Field(() => String)
  id: string;
  @Field(() => String)
  title: string;
  @Field(() => GraphQLFloat)
  price: Decimal;
  @Field(() => Int)
  stock: number;
  @Field(() => [Images], { nullable: true })
  images?: Images[];
  // todo here we could query likes but only have it be the users entity inside that, like a custom object type for this
}
