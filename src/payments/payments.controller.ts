import {
  BadRequestException,
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
    if (amount <= 0) {
      throw new BadRequestException('Amount cant be negative or zero!');
    }

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
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      throw new BadRequestException('Missing Stripe Signature');
    }

    const body = req.body;
    if (!body) {
      throw new BadRequestException('Missing Body');
    }

    return this.stripeService.webhook(sig, body, rawReq.rawBody);
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
