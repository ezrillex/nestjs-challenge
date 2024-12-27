import { IsArray, IsInt, IsNumber, IsString, IsUUID } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Images } from './images/images';

@InputType()
export class CreateVariationInput {
  @IsString()
  @Field()
  title: string;

  @Field()
  @IsNumber()
  price: number;

  @Field()
  @IsInt()
  stock: number;

  @Field(() => [String], { nullable: true })
  // @IsArray()
  // @IsUUID('all', { each: true })
  images: string[];
}
