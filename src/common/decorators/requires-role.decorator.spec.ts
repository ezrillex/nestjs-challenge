import { roles } from '@prisma/client';
import { ROLE_REQUIRED, RequiresRole } from './requires-role.decorator';

describe('Public decorator', () => {
  it('should be defined', () => {
    expect(RequiresRole).toBeDefined();
  });

  it('constant should be defined', () => {
    expect(ROLE_REQUIRED).toBeDefined();
  });

  it('constant should have not changed, prefer new constant rather than value change', () => {
    expect(ROLE_REQUIRED).toEqual('rolesRequired');
  });

  it('decorator is a function', () => {
    expect(RequiresRole).toBeInstanceOf(Function);
  });

  it('metadata key has not changed', () => {
    const decorator = RequiresRole(roles.customer);
    expect(decorator.KEY).toEqual('rolesRequired');
  });

  it('metadata is applied and it is value of customer', () => {
    const decorator = RequiresRole(roles.customer);

    const test_object = { testing: 'test' };

    decorator(test_object, decorator.KEY, null);

    expect(Reflect.getMetadata(ROLE_REQUIRED, test_object)).toEqual(
      roles.customer,
    );
  });

  it('metadata is applied and it is value of manager', () => {
    const decorator = RequiresRole(roles.manager);

    const test_object = { testing: 'test' };

    decorator(test_object, decorator.KEY, null);

    expect(Reflect.getMetadata(ROLE_REQUIRED, test_object)).toEqual(
      roles.manager,
    );
  });

  it('metadata is applied and it is value of admin', () => {
    const decorator = RequiresRole(roles.admin);

    const test_object = { testing: 'test' };

    decorator(test_object, decorator.KEY, null);

    expect(Reflect.getMetadata(ROLE_REQUIRED, test_object)).toEqual(
      roles.admin,
    );
  });

  it('metadata is applied and it is value of public', () => {
    const decorator = RequiresRole(roles.public);

    const test_object = { testing: 'test' };

    decorator(test_object, decorator.KEY, null);

    expect(Reflect.getMetadata(ROLE_REQUIRED, test_object)).toEqual(
      roles.public,
    );
  });
});
