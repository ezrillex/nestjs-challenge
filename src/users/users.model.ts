import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import { LikesOfProducts } from '../likes/LikesOfProducts.model';
import { roles } from '@prisma/client';

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

  @Field(() => String)
  role: roles;

  @Field(() => Date)
  created_at: Date;

  @Field(() => Date)
  login_at?: Date;

  @Field(() => Date)
  password_last_updated?: Date;

  @Field(() => [LikesOfProducts])
  likes_products?: LikesOfProducts[];

  password_reset_requests?: number;
  password_reset_requests_timestamps?: Date[];
  failed_login_attempts_timestamps?: Date[];
  password?: string;
  password_reset_token?: string;
  session_token?: string;
}
