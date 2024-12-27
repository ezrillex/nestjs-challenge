import { CreateProductInput } from './createProduct.input';

describe('CreateProductDto', () => {
  it('should be defined', () => {
    expect(new CreateProductInput()).toBeDefined();
  });
});
