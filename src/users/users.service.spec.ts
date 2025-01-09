import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Users } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find one by email user', () => {
    it('should error if email was not found', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);

      await expect(
        service.findOneByEmail('some@email.com'),
      ).rejects.toThrowErrorMatchingSnapshot('user with email not found');
    });

    it('should return a user if found', async () => {
      const user = { id: 'some id of a user we fetched' } as Users;
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(user);

      await expect(service.findOneByEmail('some@email.com')).resolves.toEqual(
        user,
      );
    });
  });

  describe('find one by user ID', () => {
    it('should throw if id was not found', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);

      await expect(
        service.findOneByID('some id'),
      ).rejects.toThrowErrorMatchingSnapshot('user with ID not found');
    });

    it('should return user if found', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue({
        id: '86d739f2-ed29-4a29-8034-e4e2c562e380',
      } as Users);

      await expect(
        service.findOneByID('86d739f2-ed29-4a29-8034-e4e2c562e380'),
      ).resolves.toEqual({
        id: '86d739f2-ed29-4a29-8034-e4e2c562e380',
      });
    });
  });
});
