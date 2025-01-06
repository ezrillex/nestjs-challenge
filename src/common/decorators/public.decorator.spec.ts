import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('Public decorator', () => {
  it('should be defined', () => {
    expect(Public).toBeDefined();
  });

  it('constant should be defined', () => {
    expect(IS_PUBLIC_KEY).toBeDefined();
  });

  it('constant should have not changed, prefer new constant rather than value change', () => {
    expect(IS_PUBLIC_KEY).toEqual('isPublic');
  });

  it('decorator is a function', () => {
    expect(Public).toBeInstanceOf(Function);
  });

  it('metadata key has not changed', () => {
    const decorator = Public();
    expect(decorator.KEY).toEqual('isPublic');
  });

  it('metadata is applied and it is value true', () => {
    const decorator = Public();

    const test_object = { testing: 'test' };

    decorator(test_object, decorator.KEY, null);

    expect(Reflect.getMetadata(IS_PUBLIC_KEY, test_object)).toEqual(true);
  });
});
