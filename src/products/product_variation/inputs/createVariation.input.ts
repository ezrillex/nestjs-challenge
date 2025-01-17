import { IsInt, IsNumber, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

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
}
