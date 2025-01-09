import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Categories {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}
