import {
  IS_PUBLIC_PRIVATE_KEY,
  PublicPrivate,
} from './public_and_private.decorator';

describe('Public decorator', () => {
  it('should be defined', () => {
    expect(PublicPrivate).toBeDefined();
  });

  it('constant should be defined', () => {
    expect(IS_PUBLIC_PRIVATE_KEY).toBeDefined();
  });

  it('constant should have not changed, prefer new constant rather than value change', () => {
    expect(IS_PUBLIC_PRIVATE_KEY).toEqual('isPublicPrivate');
  });

  it('decorator is a function', () => {
    expect(PublicPrivate).toBeInstanceOf(Function);
  });

  it('metadata key has not changed', () => {
    const decorator = PublicPrivate();
    expect(decorator.KEY).toEqual('isPublicPrivate');
  });

  it('metadata is applied and it is value true', () => {
    const decorator = PublicPrivate();

    const test_object = { testing: 'test' };

    decorator(test_object, decorator.KEY, null);

    expect(Reflect.getMetadata(IS_PUBLIC_PRIVATE_KEY, test_object)).toEqual(
      true,
    );
  });
});
