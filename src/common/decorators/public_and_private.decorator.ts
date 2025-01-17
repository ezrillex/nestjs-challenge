import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_PRIVATE_KEY = 'isPublicPrivate';
export const PublicPrivate = (): CustomDecorator =>
  SetMetadata(IS_PUBLIC_PRIVATE_KEY, true);
