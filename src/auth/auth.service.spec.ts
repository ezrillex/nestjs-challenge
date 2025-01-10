import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { roles, Users } from '@prisma/client';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailsService } from '../emails/emails.service';

jest.mock('@sendgrid/mail', () => {
  return {
    __esModule: true, // Indicates that this is a module with default export
    default: {
      setApiKey: jest.fn(), // Mock setApiKey method
      send: jest.fn(), // Mock send method
    },
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let prismaService: PrismaService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        ConfigService,
        AuthService,
        UsersService,
        EmailsService,
      ],
      imports: [
        JwtModule.registerAsync({
          global: false,
          useFactory: async () => ({
            secret: 'TEST_SECRET',
            signOptions: { expiresIn: '24h' },
          }),
        }),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
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
        service.registerUser({
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
        service.registerUser({
          email: 'some@email.com',
          password: 'somepassword',
          last_name: 'smith',
          first_name: 'john',
          repeat_password: 'somepassword',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('email is already in use');
    });

    it('should create if checks are ok', async () => {
      let result;
      jest
        .spyOn(prismaService.users, 'create')
        .mockImplementation(({ data }) => {
          result = data;
          return null;
        });

      await service.registerUser({
        email: 'some@email.com',
        password: 'somepassword',
        last_name: 'smith',
        first_name: 'john',
        repeat_password: 'somepassword',
      });

      expect(result).toEqual({
        email: 'some@email.com',
        password: expect.any(String),
        last_name: 'smith',
        first_name: 'john',
        role: roles.customer,
      });
    });

    it('should role be customer even if email is admin when env auto role is off ', async () => {
      let result;
      jest
        .spyOn(prismaService.users, 'create')
        .mockImplementation(({ data }) => {
          result = data;
          return null;
        });
      jest.spyOn(configService, 'get').mockImplementation(() => {
        return 'FALSE';
      });

      await service.registerUser({
        email: 'name+admin@email.com',
        password: 'somepassword',
        last_name: 'smith',
        first_name: 'john',
        repeat_password: 'somepassword',
      });

      expect(result).toEqual({
        email: 'name+admin@email.com',
        password: expect.any(String),
        last_name: 'smith',
        first_name: 'john',
        role: roles.customer,
      });
    });

    it('should role be admin if email is admin when env auto role is on ', async () => {
      let result;
      jest
        .spyOn(prismaService.users, 'create')
        .mockImplementation(({ data }) => {
          result = data;
          return null;
        });

      jest.spyOn(configService, 'get').mockReturnValue('TRUE');

      await service.registerUser({
        email: 'name+admin@email.com',
        password: 'somepassword',
        last_name: 'smith',
        first_name: 'john',
        repeat_password: 'somepassword',
      });

      expect(result).toEqual({
        email: 'name+admin@email.com',
        password: expect.any(String),
        last_name: 'smith',
        first_name: 'john',
        role: roles.admin,
      });
    });

    it('should role be manager if email is manager when env auto role is on ', async () => {
      let result;
      jest
        .spyOn(prismaService.users, 'create')
        .mockImplementation(({ data }) => {
          result = data;
          return null;
        });

      jest.spyOn(configService, 'get').mockReturnValue('TRUE');

      await service.registerUser({
        email: 'name+manager@email.com',
        password: 'somepassword',
        last_name: 'smith',
        first_name: 'john',
        repeat_password: 'somepassword',
      });

      expect(result).toEqual({
        email: 'name+manager@email.com',
        password: expect.any(String),
        last_name: 'smith',
        first_name: 'john',
        role: roles.manager,
      });
    });
  });

  describe('Login attempt failed ', () => {
    it('should modify the db to append timestamp and shift it to 3', async () => {
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

  describe('login attempt successfully', () => {
    it('passes a well formed query to db update', async () => {
      let result;
      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        result = data;
        return null;
      });
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      await service.loginAttemptSuccess('test_id', 'test_token');
      expect(result).toEqual({
        where: { id: 'test_id' },
        data: {
          login_at: now.toISOString(),
          session_token: 'test_token',
        },
      });
    });
  });

  describe('forgot password requested', () => {
    it('should modify the db to append timestamp and shift it to 3', async () => {
      let result;

      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        result = data;
        return null;
      });
      const past = new Date(1999, 2, 20, 1, 50, 20);
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await service.forgotPasswordRequest(
        'some id',
        [past, past, past],
        'made up token',
      );
      expect(result).toMatchSnapshot('expected database update');
    });
  });

  describe('reset password', () => {
    it('should update the database', async () => {
      let result;

      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        data.data.password = expect.any(String);
        result = data;
        return null;
      });
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await service.resetPassword('some id', 'the new password');
      expect(result).toMatchSnapshot('the expected database update');
    });

    it('should hash the password', async () => {
      let result;

      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        result = data;
        return null;
      });
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await service.resetPassword('some id', 'the new password');
      expect(result.data.password).not.toEqual('the new password');
    });
  });

  describe('logout user', () => {
    it('should update db with valid logout user request', async () => {
      let result;

      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        result = data;
        return null;
      });
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await service.logoutUser('some id');
      expect(result).toMatchSnapshot('the expected database update');
    });
  });

  describe('login user', () => {
    it('should error if credentials email doesnt exist', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockReset();
      await expect(
        service.loginUser({
          email: 'some@email.com',
          password: 'some password',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('email not found response');
    });

    it('should error if password is incorrect', async () => {
      // util is tested already.
      const util = jest
        .spyOn(service, 'util_isIn24h')
        .mockImplementation(() => {});

      // tested already
      jest.spyOn(service, 'loginAttemptFailed').mockResolvedValue(null);

      // hash of 'therightpassword'
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({
        id: 'test id',
        password:
          '$2y$10$Xzx25dxZ/cq0xn7toLj1HuZ1ZMfId8gRuR3VBGvX9fWdboh9xZrMa',
      } as Users);

      await expect(
        service.loginUser({
          email: 'some@email.com',
          password: 'thewrongpassword',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('wrong password response');
      expect(util).toHaveBeenCalled();
    });

    it('should return token and role if all ok', async () => {
      // is already tested.
      jest.spyOn(service, 'util_isIn24h').mockImplementation(() => {});
      jest.spyOn(service, 'loginAttemptFailed').mockResolvedValue(null);
      jest.spyOn(service, 'loginAttemptSuccess').mockResolvedValue(null);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('my_token');

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({
        id: 'test id',
        role: roles.customer,
        password:
          '$2b$10$fhpIpbwfaJlbiOZPDKlKxuV71lFjOk3EeX9npe.LSF0fIyiouR2i2',
      } as Users);

      await expect(
        service.loginUser({
          email: 'some@email.com',
          password: 'therightpassword',
        }),
      ).resolves.toMatchSnapshot('ok response');
    });
  });

  describe('forgot password ', () => {
    it('should return status string with token', async () => {
      // is already tested.
      jest.spyOn(service, 'util_isIn24h').mockImplementation(() => {});
      jest.spyOn(service, 'forgotPasswordRequest').mockResolvedValue({
        password_reset_requests: 1,
        password_reset_requests_timestamps: [
          new Date(2020, 12, 12, 12, 12, 12),
        ],
      } as Users);
      jest.spyOn(jwtService, 'sign').mockReturnValue('my_token');

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({} as Users);

      await expect(
        service.forgotPassword({
          email: 'some@email.com',
        }),
      ).resolves.toEqual({
        message:
          'An email has been sent with a link to reset the password. Check your email.',
        request_count: 1,
        request_timestamps: [new Date(2020, 12, 12, 12, 12, 12)],
      });
    });
  });

  describe('change password ', () => {
    it('should throw if password mismatch', async () => {
      await expect(
        service.changePassword({
          password: 'a',
          repeat_password: 'b',
          reset_token: 'my_token',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('mismatch password response');
    });

    it('should throw if token is malformed', async () => {
      await expect(
        service.changePassword({
          password: 'a',
          repeat_password: 'a',
          reset_token: 'my_token',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('token is malformed');
    });

    it('should throw if token is invalid', async () => {
      await expect(
        service.changePassword({
          password: 'a',
          repeat_password: 'a',
          reset_token:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MzU5NDAyMzYsImV4cCI6MTc2NzQ3NjIzNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.vwn02EWxfKdm0bVyaLFQVpTWevnsEah5lRu_gU27vCk',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('token is invalid');
    });

    it('should throw if payload user token mismatch (requested again, or already used and tried to use link again)', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ user: 'some_user_id' });
      jest.spyOn(usersService, 'findOneByID').mockResolvedValue({
        password_reset_token: 'some_random_token',
      } as Users);

      await expect(
        service.changePassword({
          password: 'a',
          repeat_password: 'a',
          reset_token: 'my_token',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('token mismatch, invalidated');
    });

    it('should return message password was reset', async () => {
      // is already tested.
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ user: 'some_user_id' });
      jest.spyOn(usersService, 'findOneByID').mockResolvedValue({
        password_reset_token: 'my_token',
      } as Users);
      jest.spyOn(service, 'resetPassword').mockResolvedValue({
        password_last_updated: new Date(2020, 12, 12, 12, 12, 12),
      } as Users);

      await expect(
        service.changePassword({
          password: 'a',
          repeat_password: 'a',
          reset_token: 'my_token',
        }),
      ).resolves.toEqual({
        message: 'The password has been reset successfully!',
        password_last_updated: new Date(2020, 12, 12, 12, 12, 12),
      });
    });
  });
});
