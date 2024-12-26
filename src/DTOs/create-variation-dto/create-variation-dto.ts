import { IsArray, IsInt, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateVariationDto {
  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsInt()
  stock: number;

  @IsArray()
  @IsUUID('all', { each: true })
  images: string[];
}
