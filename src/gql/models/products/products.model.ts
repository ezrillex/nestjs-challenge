import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { ProductVariations } from './product-variations/product-variations';
import { Categories } from './categories/categories';

@ObjectType()
export class Products {
  @Field(() => ID)
  id: string;

  @Field(() => Boolean)
  is_published: boolean;

  @Field(() => Boolean)
  is_deleted: boolean;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => [ProductVariations])
  likes: ProductVariations[];

  @Field(() => [ProductVariations])
  variations: ProductVariations[];

  @Field(() => [Categories])
  categories: Categories[];

  @Field(() => String)
  created_by: string;

  @Field(() => Date)
  created_at: string;

  @IsUUID()
  @Field(() => String, { nullable: true })
  last_updated_by: string;

  @Field(() => String, { nullable: true })
  last_updated_at: string;
}
