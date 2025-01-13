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

  it('ImagesService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ConfigService should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('PrismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('ProductsService should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should throw an error for invalid image mime type', async () => {
      await expect(
        service.uploadImage(
          'the_base_64',
          'video/webp',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('image must be valid mime type');
    });

    it('should successfully accept valid image mime type', async () => {
      await expect(
        service.uploadImage(
          'the_base_64',
          'image/jpeg',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('product variation not found');
    });

    it('should throw an error if product variation id is invalid', async () => {
      await expect(
        service.uploadImage(
          'the_base_64',
          'image/jpeg',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).rejects.toThrowErrorMatchingSnapshot('product variation not found');
    });

    it('should throw an error if CDN didn’t provide the required public id', async () => {
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

    it('should create a record in the database after successful upload', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2020, 12, 12, 12, 12));
      const mock_cdn_response = {
        public_id: '8b3ae683-0626-44be-b591-9271e288388f',
        secure_url: 'https://www.cloudinary.com/',
      } as UploadApiResponse;
      jest
        .spyOn(cloudinary.uploader, 'upload')
        .mockResolvedValue(mock_cdn_response);

      jest
        .spyOn(productService, 'GetProductVariationById')
        .mockResolvedValue(1);

      const spy = jest
        .spyOn(prismaService.images, 'create')
        .mockResolvedValue(null);

      await expect(
        service.uploadImage(
          'the_base_64',
          'image/jpeg',
          '2730fc05-6f87-49e5-8a41-559208048ebe',
        ),
      ).resolves.not.toThrow();
      expect(spy.mock.calls).toMatchSnapshot('query all ok');
    });
  });

  describe('deleteImageById', () => {
    it('should throw an error for invalid image id', async () => {
      jest.spyOn(prismaService.images, 'findUnique').mockReset();
      await expect(
        service.deleteImageById('2730fc05-6f87-49e5-8a41-559208048ebe'),
      ).rejects.toThrowErrorMatchingSnapshot('image not found');
    });

    it('should throw an error when CDN fails and returns unsuccessful response', async () => {
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

    it('should return successfully deleted image when CDN response is ok', async () => {
      const mock_cdn_response = {
        result: 'ok',
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

      const spy = jest
        .spyOn(prismaService.images, 'delete')
        .mockResolvedValue(null);

      await expect(
        service.deleteImageById('2730fc05-6f87-49e5-8a41-559208048ebe'),
      ).resolves.toEqual(null);
      expect(spy.mock.calls).toMatchSnapshot('request sent to prisma');
    });
  });

  describe('getImagesByProductVariation', () => {});
});
