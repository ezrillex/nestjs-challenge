import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../decorators/public/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../services/authentication/auth.service';
import { DateTime } from 'luxon';
import { IS_PUBLIC_PRIVATE_KEY } from '../../decorators/public_and_private/public_and_private.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}
  // TODO make the 2 code paths gql and regular more clean
  async canActivate(context: ExecutionContext) {
    console.log('Auth Guard triggered.');

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let token;
    let gql_request;
    //@ts-expect-error graphql is a value that is returned by this.
    if (context.getType() === 'graphql') {
      const gql_context = GqlExecutionContext.create(context);
      gql_request = gql_context.getContext().req;
      token = gql_request.headers.authorization;
    } else {
      token = request.headers.authorization;
    }

    const isPublicPrivate = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PRIVATE_KEY,
      [context.getHandler(), context.getClass()],
    );
    // if you are sending any token info on a semi public api then it means you meant to use the
    // auth version of it. To access the public side then do not send any token headers.
    if (!token && isPublicPrivate) {
      // @ts-expect-error the value IS graphql
      if (context.getType() === 'graphql') {
        gql_request['public_private_mode'] = 'public';
      } else {
        request['public_private_mode'] = 'public';
      }
      return true;
    }

    if (!token || token.length <= 7) {
      throw new UnauthorizedException('Bearer token is missing or is invalid.');
    }
    const onlyToken = token.substring(7);
    let payload: { user: string };
    try {
      payload = await this.jwtService.verifyAsync(onlyToken);
    } catch {
      throw new UnauthorizedException('Bearer token is invalid.');
    }

    const user = await this.authService.findOneByID(payload.user);

    if (!user.session_token) {
      throw new UnauthorizedException('User has no active sessions.');
    }

    if (onlyToken !== user.session_token) {
      throw new UnauthorizedException(
        'The provided token is no longer valid. Make sure to authenticate with your most up-to-date token.',
      );
    }

    // check login is inside the expiry period.
    const threeDaysAgo = DateTime.now().minus({ days: 3 });
    const login_at = DateTime.fromISO(user.login_at.toISOString());
    if (login_at <= threeDaysAgo) {
      throw new UnauthorizedException('Token has expired.');
    }

    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    // @ts-expect-error it does have that value...
    if (context.getType() === 'graphql') {
      gql_request['user'] = user;
      gql_request['public_private_mode'] = 'private';
    } else {
      request['user'] = user;
      request['public_private_mode'] = 'private';
    }

    return true;
  }
}
