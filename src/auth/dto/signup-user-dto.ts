import { IsEmail, IsString, Length } from 'class-validator';

export class SignupUserDto {
  @IsString()
  @Length(1, 60)
  first_name: string;

  @IsString()
  @Length(1, 120)
  last_name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsString()
  @Length(8, 128)
  repeat_password: string;
}
