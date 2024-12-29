import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetProductsInput {
  @Field(() => Int, { nullable: true })
  first: number;

  @Field(() => Int, { nullable: true })
  offset: number;

  @Field(() => [ID], { nullable: true })
  categoryFilter: string[];

  @Field(() => String, { nullable: true })
  search: string;

  @Field(() => Boolean, { nullable: true })
  likedOnly: boolean;

  @Field(() => Boolean, { nullable: true })
  omitImages: boolean;

  @Field(() => String, { nullable: true })
  sort: string;
}
