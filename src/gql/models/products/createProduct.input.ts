import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVariationInput } from './createVariation.input';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field()
  description: string;

  @Field(() => [CreateVariationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateVariationInput)
  variations: CreateVariationInput[];
}
