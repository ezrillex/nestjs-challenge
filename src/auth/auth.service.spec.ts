import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ConfigService, AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined util 24 hours', () => {
    expect(service.util_isIn24h).toBeDefined();
  });

  it('should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  describe('is in 24 hour period utility', () => {
    it('Should not error if no timestamps are provided', () => {
      expect(() => service.util_isIn24h([])).not.toThrow();
    });

    it('Should error if 3 timestamps are in 24 hours', () => {
      const now = new Date();
      expect(() =>
        service.util_isIn24h([now, now, now]),
      ).toThrowErrorMatchingSnapshot('too many in 24 h');
    });

    it('Should not error if 2 timestamps are in 24 hours', () => {
      const now = new Date();
      expect(() => service.util_isIn24h([now, now])).not.toThrow();
    });

    it('Should not error if not passed an array', () => {
      expect(() => service.util_isIn24h(undefined)).not.toThrow();
    });

    it('Should not error if times are in the past', () => {
      const past = new Date(1999, 2, 20, 1, 50, 20);
      expect(() => service.util_isIn24h([past, past, past])).not.toThrow();
    });
  });

  describe('create user', () => {
    it('should error if password is different', async () => {
      await expect(
        service.createUser({
          email: 'some@email.com',
          password: 'somepassword!',
          last_name: 'smith',
          first_name: 'john',
          repeat_password: 'somepassword',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('password mismatch');
    });

    it('should error if email is already in use', async () => {
      jest.spyOn(prismaService.users, 'count').mockResolvedValue(1);

      await expect(
        service.createUser({
          email: 'some@email.com',
          password: 'somepassword',
          last_name: 'smith',
          first_name: 'john',
          repeat_password: 'somepassword',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('email is already in use');
    });
  });

  describe('find one by email user', () => {
    it('should error if email was not found', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);

      await expect(
        service.findOneByEmail('some@email.com'),
      ).rejects.toThrowErrorMatchingSnapshot('user with email not found');
    });
  });

  describe('find one by ID user', () => {
    it('should error if id was not found', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);

      await expect(
        service.findOneByID('some id'),
      ).rejects.toThrowErrorMatchingSnapshot('user with ID not found');
    });
  });

  describe('should modify the db to append timestamp and shift it to 3', () => {
    it('if array of 4 it should append to end current time', async () => {
      let result;

      jest
        .spyOn(prismaService.users, 'update')
        .mockImplementation(({ data }) => {
          result = data;
          return null;
        });
      const past = new Date(1999, 2, 20, 1, 50, 20);
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await service.loginAttemptFailed('some id', [past, past, past]);
      expect(result.failed_login_attempts_timestamps).toEqual([
        past,
        past,
        now,
      ]);
    });
  });
});
