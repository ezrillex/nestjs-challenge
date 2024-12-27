import { CreateVariationInput } from './createVariation.input';

describe('CreateVariationDto', () => {
  it('should be defined', () => {
    expect(new CreateVariationInput()).toBeDefined();
  });
});
