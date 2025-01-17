import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { ProductsService } from '../../products/products.service';
import { EMAIL_TEMPLATE, EmailsService } from '../../emails/emails.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { faker } from '@faker-js/faker';
import { Decimal } from '@prisma/client/runtime/library';

jest.mock('@sendgrid/mail', () => {
  return {
    __esModule: true, // Indicates that this is a module with default export
    default: {
      setApiKey: jest.fn(), // Mock setApiKey method
      send: jest.fn(), // Mock send method
    },
  };
});

describe('TasksService', () => {
  let service: TasksService;
  let productsService: ProductsService;
  let emailsService: EmailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        ProductsService,
        EmailsService,
        PrismaService,
        ConfigService,
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    productsService = module.get(ProductsService);
    emailsService = module.get(EmailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('randomCron', () => {
    it('should be defined', () => {
      expect(service.randomCron).toBeDefined();
    });

    it('logs the date and a random number', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const mathSpy = jest.spyOn(Math, 'random').mockReturnValueOnce(0.5);
      const dateSpy = jest.spyOn(Date.prototype, 'toLocaleString');
      jest.useFakeTimers().setSystemTime(new Date(2020, 12, 12, 12, 12, 12));

      await expect(service.randomCron()).resolves.not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Current Time: 1/12/2021, 12:12:12 PM, random number: 0.5',
      );
      expect(mathSpy).toHaveBeenCalled();
      expect(dateSpy).toHaveBeenCalled();
    });
  });

  describe('marketingLowStockProducts', () => {
    it('should be defined', () => {
      expect(service.marketingLowStockProducts).toBeDefined();
    });

    it('should stop if there are no possible leads', async () => {
      const productSpy = jest
        .spyOn(productsService, 'getLowStockProducts')
        .mockResolvedValueOnce([]);

      const reduceSpy = jest.spyOn(Array.prototype, 'reduce');

      await expect(
        service.marketingLowStockProducts(),
      ).resolves.toBeUndefined();
      expect(reduceSpy).not.toHaveBeenCalled();
      expect(productSpy).toHaveBeenCalled();
    });

    it('sends emails to marketing leads', async () => {
      const data = [
        {
          id: 'bbb0fbd8-c277-4983-bdcb-b6ddb13a4c30',
          title: 'LOW STOCK ONE',
          price: new Decimal(99.98),
          stock: 3,
          product_id: 'cc4f8da6-acc4-456c-812a-8ce92bdb8f43',
          last_updated_by: '1c9c4833-1395-4e45-9391-79ff953bc5ee',
          last_updated_at: new Date(),
          images: [
            {
              id: faker.string.uuid(),
              url: faker.image.url(),
              created_at: faker.date.recent(),
              product_variation_id: faker.string.uuid(),
            },
          ],
        },
        {
          id: '869948ed-e140-49e4-ba23-b4cd71f39252',
          title: 'LOW STOCK TWO',
          price: new Decimal(99.79),
          stock: 3,
          product_id: 'e5acfd9a-c07a-4e22-9e46-1b4aff27b285',
          last_updated_by: '1c9c4833-1395-4e45-9391-79ff953bc5ee',
          last_updated_at: new Date(),
          images: [
            {
              id: faker.string.uuid(),
              url: faker.image.url(),
              created_at: faker.date.recent(),
              product_variation_id: faker.string.uuid(),
            },
            {
              id: faker.string.uuid(),
              url: faker.image.url(),
              created_at: faker.date.recent(),
              product_variation_id: faker.string.uuid(),
            },
          ],
        },
      ];

      const productSpy = jest
        .spyOn(productsService, 'getLowStockProducts')
        .mockResolvedValueOnce(data);

      const mailerSpy = jest
        .spyOn(emailsService, 'sendManyEmails')
        .mockResolvedValueOnce();

      await expect(
        service.marketingLowStockProducts(),
      ).resolves.toBeUndefined();
      expect(productSpy).toHaveBeenCalled();
      expect(mailerSpy).toHaveBeenCalledWith([
        {
          template: EMAIL_TEMPLATE.LOW_STOCK_REMINDER,
          data: {
            product_title: data[0].title,
            product_image: data[0].images[0].url,
          },
        },
        {
          template: EMAIL_TEMPLATE.LOW_STOCK_REMINDER,
          data: {
            product_title: data[1].title,
            product_image: data[1].images[0].url,
          },
        },
      ]);
    });
  });
});
