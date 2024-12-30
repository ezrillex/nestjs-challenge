import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(exception);

    //console.log(exception, host);
    //super.catch(exception, host);

    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.

    let code;
    let message;
    if (exception instanceof HttpException) {
      console.log(exception.getStatus());
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
      console.log(exception);
      return exception;
      // const gql_host = GqlArgumentsHost.create(host);
      // const gql_context = gql_host.getContext();
      // request = gql_context.req;
      // response = gql_context.res;
      // console.log('GQL REQUEST ');
      // const { typename, key } = gql_host.getInfo().path;
      // path = `${typename}/${key}`;
      //console.log('get info gql', gql_host.getInfo());
    } else {
      request = host.switchToHttp().getRequest();
      response = host.switchToHttp().getResponse();
      console.log('HTTP REQUEST ');
      path = request.url;
    }

    const responseBody = {
      status_code: code,
      message: message,
      timestamp: new Date().toISOString(),
      path: path,
    };

    this.applicationRef.reply(response, responseBody, code);
  }
}
