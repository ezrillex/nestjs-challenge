import { IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCategoryInput {
  @IsString()
  @Field()
  name: string;
}
