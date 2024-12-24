import { IsJWT, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsJWT()
  reset_token: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsString()
  @Length(8, 128)
  repeat_password: string;
}
