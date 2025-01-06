import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Users } from '@prisma/client';

describe('Auth Guard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let authService: AuthService;
  let jwtService: JwtService;
  let context: ExecutionContext;
  let requestMock: { public_private_mode?: any; headers: any; user?: any };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        PrismaService,
        ConfigService,
        AuthService,
        Reflector,
        JwtService,
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    requestMock = {
      headers: {},
    };

    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(requestMock),
      }),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should implement can activate', () => {
    expect(guard.canActivate).toBeInstanceOf(Function);
  });

  it('should return true if endpoint is public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    await expect(guard.canActivate(context)).resolves.toEqual(true);
  });

  it('should return true if endpoint is public/private and no token provided must go into public mode', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(guard.canActivate(context)).resolves.toEqual(true);
    expect(requestMock.public_private_mode).toEqual('public');
  });

  it('should throw if endpoint is public/private and no token is provided', async () => {
    requestMock.headers.authorization = 'Bearer';
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(
      guard.canActivate(context),
    ).rejects.toThrowErrorMatchingSnapshot('Token missing or invalid error');
    // restore for other tests
    delete requestMock.headers.authorization;
  });

  it('should throw if endpoint is public/private and an invalid token is provided', async () => {
    requestMock.headers.authorization = 'Bearer SPAIN-GO';
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(
      guard.canActivate(context),
    ).rejects.toThrowErrorMatchingSnapshot('Token invalid error');
    // restore for other tests
    delete requestMock.headers.authorization;
  });

  it('should throw if endpoint is public/private and a valid token is provided, but there are no active sessions', async () => {
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ user: 'some user id' });
    jest
      .spyOn(authService, 'findOneByID')
      .mockResolvedValue({ id: 'some user id' } as Users);
    requestMock.headers.authorization = 'Bearer SPAIN-GO';
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(
      guard.canActivate(context),
    ).rejects.toThrowErrorMatchingSnapshot('No active sessions error');
    // restore for other tests
    delete requestMock.headers.authorization;
  });

  it('should throw if endpoint is public/private and a valid token is provided, but token does not match current session token', async () => {
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ user: 'some user id' });
    jest.spyOn(authService, 'findOneByID').mockResolvedValue({
      id: 'some user id',
      session_token: 'JAPAN-GO',
    } as Users);
    requestMock.headers.authorization = 'Bearer SPAIN-GO';
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(
      guard.canActivate(context),
    ).rejects.toThrowErrorMatchingSnapshot('Not the last session token error');
    // restore for other tests
    delete requestMock.headers.authorization;
  });

  it('should return true if endpoint is public/private and a valid token is provided and mode is private and user is set', async () => {
    const user = {
      id: 'some user id',
      session_token: 'SPAIN-GO',
      login_at: new Date(),
    } as Users;
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ user: 'some user id' });
    jest.spyOn(authService, 'findOneByID').mockResolvedValue(user);
    requestMock.headers.authorization = 'Bearer SPAIN-GO';
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(guard.canActivate(context)).resolves.toEqual(true);
    expect(requestMock.user).toEqual(user);
    expect(requestMock.public_private_mode).toEqual('private');
    // restore for other tests
    delete requestMock.headers.authorization;
    delete requestMock.user;
    delete requestMock.public_private_mode;
  });
  it('should throw if endpoint is public/private and a valid token is provided but is older than 3 days', async () => {
    const user = {
      id: 'some user id',
      session_token: 'SPAIN-GO',
      login_at: new Date(2020, 12, 12, 12, 12, 12),
    } as Users;
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ user: 'some user id' });
    jest.spyOn(authService, 'findOneByID').mockResolvedValue(user);
    requestMock.headers.authorization = 'Bearer SPAIN-GO';
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(
      guard.canActivate(context),
    ).rejects.toThrowErrorMatchingSnapshot('token expired older 3 days');
    // restore for other tests
    delete requestMock.headers.authorization;
  });

  it('GRAPHQL should return true if endpoint is public/private and a valid token is provided and mode is private and user is set', async () => {
    const gqlRequest = {
      headers: {
        authorization: 'Bearer SPAIN-GO',
      },
    };

    context.getType = jest.fn().mockReturnValue('graphql');
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: jest.fn().mockReturnValue({
        req: gqlRequest,
      }),
    } as unknown as GqlExecutionContext);

    const user = {
      id: 'some user id',
      session_token: 'SPAIN-GO',
      login_at: new Date(),
    } as Users;
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ user: 'some user id' });
    jest.spyOn(authService, 'findOneByID').mockResolvedValue(user);
    requestMock.headers.authorization = 'Bearer SPAIN-GO';
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(guard.canActivate(context)).resolves.toEqual(true);
    expect(gqlRequest['user']).toEqual(user);
    expect(gqlRequest['public_private_mode']).toEqual('private');
  });

  it('GRAPHQL throws if endpoint is public/private and an invalid token is provided', async () => {
    const gqlRequest = {
      headers: {
        authorization: 'Bearer JAPAN-GO',
      },
    };

    context.getType = jest.fn().mockReturnValue('graphql');
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: jest.fn().mockReturnValue({
        req: gqlRequest,
      }),
    } as unknown as GqlExecutionContext);

    const user = {
      id: 'some user id',
      session_token: 'SPAIN-GO',
      login_at: new Date(),
    } as Users;
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ user: 'some user id' });
    jest.spyOn(authService, 'findOneByID').mockResolvedValue(user);
    requestMock.headers.authorization = 'Bearer SPAIN-GO';
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(
      guard.canActivate(context),
    ).rejects.toThrowErrorMatchingSnapshot('token invalid graphql');
  });

  it('GRAPHQL returns true if endpoint is public/private and no token is provided, mode is set to public', async () => {
    const gqlRequest = {
      headers: {},
    };

    context.getType = jest.fn().mockReturnValue('graphql');
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: jest.fn().mockReturnValue({
        req: gqlRequest,
      }),
    } as unknown as GqlExecutionContext);

    const user = {
      id: 'some user id',
      session_token: 'SPAIN-GO',
      login_at: new Date(),
    } as Users;
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockResolvedValue({ user: 'some user id' });
    jest.spyOn(authService, 'findOneByID').mockResolvedValue(user);
    requestMock.headers.authorization = 'Bearer SPAIN-GO';
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined) // is public
      .mockReturnValueOnce(true); // is public private
    await expect(guard.canActivate(context)).resolves.toEqual(true);
  });
});
