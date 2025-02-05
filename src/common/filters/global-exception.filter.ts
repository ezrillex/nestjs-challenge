import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  constructor(
    param: any,
    private readonly configService: ConfigService,
  ) {
    super(param);
  }

  catch(exception: any, host: ArgumentsHost): any | void {
    if (this.configService.get<boolean>('LOG_ERRORS')) {
      // eslint-disable-next-line
      console.log(exception);
    }

    let code;
    let message;
    if (exception instanceof HttpException) {
      code = exception.getStatus();
      message = exception.message;
    } else {
      code = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unkown error occurred';
    }

    let request;
    let response;
    let path;
    // @ts-expect-error it does return graphql.
    if (host.getType() === 'graphql') {
      return exception;
    } else {
      request = host.switchToHttp().getRequest();
      response = host.switchToHttp().getResponse();
      path = request.url;
    }
    const responseBody = {
      status_code: code,
      message: message,
      timestamp: new Date().toISOString(),
      path: path,
    };
    const details = exception.response?.message;
    if (details) {
      responseBody['details'] = details;
    }

    this.applicationRef.reply(response, responseBody, code);
  }
}
