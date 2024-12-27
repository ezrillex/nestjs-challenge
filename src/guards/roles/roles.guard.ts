import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ROLE_REQUIRED } from '../../decorators/requires-role/requires-role.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Roles Guard triggered.');
    const rolesRequired = this.reflector.getAllAndOverride(ROLE_REQUIRED, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesRequired) {
      return true;
    }

    let request;
    //@ts-expect-error graphql is a value that is returned by this.
    if (context.getType() === 'graphql') {
      const gql_context = GqlExecutionContext.create(context);
      request = gql_context.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    if (request.user && request.user.role === rolesRequired) {
      return true;
    } else {
      throw new ForbiddenException(
        'User lacks the necessary role for performing the action.',
      );
    }
  }
}
