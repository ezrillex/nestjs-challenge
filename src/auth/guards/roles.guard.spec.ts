import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { roles } from '@prisma/client';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('Roles Guard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should implement can activate', () => {
    expect(guard.canActivate).toBeInstanceOf(Function);
  });

  it('should be true if it cant get any metadata set by decorator that specifies roles that are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    expect(
      guard.canActivate({
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext),
    ).toEqual(true);
  });

  it('throws if user lacks the role required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles.manager);
    expect(() => {
      guard.canActivate({
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: roles.customer,
            },
          }),
        }),
      } as unknown as ExecutionContext);
    }).toThrowErrorMatchingSnapshot('insufficient permissions');
  });

  it('is true if sufficient permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles.customer);
    expect(
      guard.canActivate({
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: roles.customer,
            },
          }),
        }),
      } as unknown as ExecutionContext),
    ).toEqual(true);
  });

  it('it is able to fetch data for graphql query, returns true if ok permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles.customer);
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: jest.fn().mockReturnValue({
        req: {
          user: {
            role: roles.customer,
          },
        },
      }),
    } as unknown as GqlExecutionContext);
    expect(
      guard.canActivate({
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getType: jest.fn().mockReturnValue('graphql'),
      } as unknown as ExecutionContext),
    ).toEqual(true);
  });

  it('it is able to fetch data for graphql query, throws when insufficient permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles.manager);
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: jest.fn().mockReturnValue({
        req: {
          user: {
            role: roles.customer,
          },
        },
      }),
    } as unknown as GqlExecutionContext);
    expect(() => {
      guard.canActivate({
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getType: jest.fn().mockReturnValue('graphql'),
      } as unknown as ExecutionContext);
    }).toThrowErrorMatchingSnapshot('insufficient permissions graphql');
  });
});
