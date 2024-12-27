import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVariationInput } from './createVariation.input';
import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field()
  description: string;

  @Field(() => [ID], { nullable: true })
  @IsArray()
  @IsUUID('all', { each: true })
  categories: string[];

  @Field(() => [CreateVariationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateVariationInput)
  variations: CreateVariationInput[];
}
