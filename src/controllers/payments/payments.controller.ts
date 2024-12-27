import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { Public } from 'src/decorators/public/public.decorator';

@Controller('payments')
export class PaymentsController {
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPayment(@Request() req: Request) {
    // const u = req['user'];

    return 'ok';
  }
}
