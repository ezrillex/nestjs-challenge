import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller('common')
export class CommonController {
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @Get()
  async healthService(): Promise<void> {}
}
