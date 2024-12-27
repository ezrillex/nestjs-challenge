import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => [ID], { nullable: true })
  categories: string[];

  @Field(() => Boolean, { nullable: true })
  is_published: boolean;

  // rest counterpart does not do it in one endpoint, doing separate mutation for variations. Reduces complexity.
  // @Field(() => [UpdateProductVariationInput])
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => UpdateProductVariationInput)
  // variations: UpdateProductVariationInput[];
}
