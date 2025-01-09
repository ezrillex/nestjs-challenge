import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Images } from '../../images/images.model';

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
  // todo here we could query likes but only have it be the users entity inside that
}
