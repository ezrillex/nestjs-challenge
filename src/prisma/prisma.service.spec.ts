import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have init method defined', () => {
    expect(service.onModuleInit).toBeDefined();
  });

  it('should inherit prisma client', async () => {
    expect(service).toBeInstanceOf(PrismaClient);
  });

  it('connection is called', async () => {
    const spy = jest.spyOn(service, '$connect');
    await service.onModuleInit();
    expect(spy).toHaveBeenCalled();
  });
});
