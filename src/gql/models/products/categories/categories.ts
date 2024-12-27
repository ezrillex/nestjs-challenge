import { Field, ObjectType } from '@nestjs/graphql';
import { Products } from '../products';

@ObjectType()
export class Categories {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => [Products])
  products: Products[];
}
