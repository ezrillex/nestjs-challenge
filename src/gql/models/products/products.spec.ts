import { Products } from './products.model';

describe('Products', () => {
  it('should be defined', () => {
    expect(new Products()).toBeDefined();
  });
});
