import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { ProductsService } from '../../products/products.service';
import { EmailsService } from '../../emails/emails.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
