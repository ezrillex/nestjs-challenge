import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  RawBodyRequest,
  Req,
  Request,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { roles } from '@prisma/client';
import { RequiresRole } from '../common/decorators/requires-role.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private stripeService: StripeService) {}

  @RequiresRole(roles.customer)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @Body('order_id', ParseUUIDPipe) order_id: string,
    @Body('amount', ParseIntPipe) amount: number,
    @Request() req: Request,
  ) {
    return this.stripeService.createPaymentIntent(
      amount,
      order_id,
      req['user'].id,
    );
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  async updatePaymentWebhook(
    @Request() req: Request,
    @Req() rawReq: RawBodyRequest<Request>,
  ) {
    return this.stripeService.webhook(req, rawReq.rawBody);
  }

  @RequiresRole(roles.customer)
  @Get(':order_id')
  @HttpCode(HttpStatus.OK)
  async getPayments(
    @Param('order_id', ParseUUIDPipe) order_id: string,
    @Request() req: Request,
  ) {
    return this.stripeService.getOrderPayments(order_id, req['user'].id);
  }

  // FOR TESTING PURPOSES ONLY --------------------------------
  @RequiresRole(roles.admin)
  @Put()
  @HttpCode(HttpStatus.OK)
  async updatePaymentIntent(
    @Body('payment_id', ParseUUIDPipe) payment_id: string,
    @Body('payment_method') payment_method: string,
  ) {
    return this.stripeService.updatePaymentIntent(payment_id, payment_method);
  }
}
