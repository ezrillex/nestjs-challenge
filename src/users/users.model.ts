import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import { LikesOfProducts } from '../likes/LikesOfProducts.model';

@ObjectType()
export class Users {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  first_name: string;

  @Field(() => String)
  last_name: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @Field(() => [LikesOfProducts])
  likes_products?: LikesOfProducts[];
}
