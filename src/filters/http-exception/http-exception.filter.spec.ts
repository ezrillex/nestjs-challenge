import { GlobalExceptionFilter } from './global-exception.filter';

describe('HttpExceptionFilter', () => {
  it('should be defined', () => {
    expect(new GlobalExceptionFilter()).toBeDefined();
  });
});
