import { IsBase64, IsMimeType, IsString, IsUUID } from 'class-validator';

export class CreateImageDto {
  @IsUUID('all')
  @IsString()
  product_variation_id: string;

  @IsString()
  @IsMimeType()
  image_mime_type: string;

  @IsBase64({ urlSafe: false })
  @IsString()
  image: string;
}
