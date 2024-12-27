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

  // Images should be uploaded and deleted from the /files rest api. GQL is only a way to query them.
  // As per IDK who mentioned that fabio said that files could be rest.
}
