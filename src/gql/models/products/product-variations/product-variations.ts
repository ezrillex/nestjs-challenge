import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Images } from '../images/images';

@ObjectType()
export class ProductVariations {
  @Field(() => String)
  id: string;
  @Field(() => String)
  title: string;
  @Field(() => Number)
  price: number;
  @Field(() => Int)
  stock: number;
  @Field(() => [Images], { nullable: true })
  images: Images[];
}
