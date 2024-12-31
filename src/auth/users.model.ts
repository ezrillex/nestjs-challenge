import { Field, ID, ObjectType } from '@nestjs/graphql';
import { LikesOfProducts } from '../likes/likes_of_products';
import { IsEmail } from 'class-validator';

// partial implementation of actual table due to graphql not dealing with auth and roles
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
  likes_products: LikesOfProducts[];
}
