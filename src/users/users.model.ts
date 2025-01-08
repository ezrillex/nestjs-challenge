import { Field, ID, ObjectType } from '@nestjs/graphql';
import { LikesOfProducts } from '../likes/likes_of_products.model';
import { IsEmail } from 'class-validator';

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

  @Field(() => [LikesOfProducts], { nullable: true })
  likes_products: LikesOfProducts[];
}
