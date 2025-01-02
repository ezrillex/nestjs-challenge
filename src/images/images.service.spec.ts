import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

describe('ImagesService', () => {
  let service: ImagesService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let productService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, ProductsService, PrismaService, ImagesService],
    }).compile();

    service = module.get(ImagesService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
    productService = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('config service should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('prisma service should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('prisma service should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('upload image method', () => {
    it('should error if not image mime type', async () => {
      await expect(
        service.uploadImage(
          'the_base_64',
          'video/webp',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('image must be valid mime type');
    });

    it('should accept image mime type', async () => {
      await expect(
        service.uploadImage(
          'the_base_64',
          'image/jpeg',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('product variation not found');
    });

    it('should error if invalid product id', async () => {
      await expect(
        service.uploadImage(
          'the_base_64',
          'image/jpeg',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('product variation not found');
    });

    it('should error if cdn didnt provide a public id for the uploaded image. ', async () => {
      const mock_cdn_response = {
        public_id: undefined,
      } as UploadApiResponse;
      jest
        .spyOn(cloudinary.uploader, 'upload')
        .mockResolvedValue(mock_cdn_response);

      jest
        .spyOn(productService, 'GetProductVariationById')
        .mockResolvedValue(1);

      await expect(
        service.uploadImage(
          'the_base_64',
          'image/jpeg',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot(
        'CDN didnt provide the required id',
      );
    });
  });

  describe('delete image method', () => {
    it('should error if invalid image id', async () => {
      await expect(
        service.deleteImageById('2730fc05-6f87-49e5-8a41-559208048ebe'),
      ).rejects.toThrowErrorMatchingSnapshot('image not found');
    });

    it('should error if cdn failed and response was not successful ', async () => {
      const mock_cdn_response = {
        result: 'definitely not ok',
      };
      jest
        .spyOn(cloudinary.uploader, 'destroy')
        .mockResolvedValue(mock_cdn_response);

      const mock_record = {
        id: 'string',
        cdn_id: 'string',
        url: 'string',
        created_at: new Date(),
        product_variation_id: null,
      };
      jest
        .spyOn(prismaService.images, 'findUnique')
        .mockResolvedValue(mock_record);

      await expect(
        service.deleteImageById('2730fc05-6f87-49e5-8a41-559208048ebe'),
      ).rejects.toThrowErrorMatchingSnapshot('CDN result was not successful');
    });
  });
});
