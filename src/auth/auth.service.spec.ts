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

  it('AuthService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ConfigService should be defined', () => {
    expect(configService).toBeDefined();
  });

  it('PrismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('UsersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('JwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  it('checkIfAttemptsInLast24h should be defined', () => {
    expect(service.checkIfAttemptsInLast24h).toBeDefined();
  });

  it('register should be defined', () => {
    expect(service.register).toBeDefined();
  });

  it('recordFailedLoginAttempt should be defined', () => {
    expect(service.recordFailedLoginAttempt).toBeDefined();
  });

  it('recordSuccessfulLoginAttempt should be defined', () => {
    expect(service.recordSuccessfulLoginAttempt).toBeDefined();
  });

  it('recordPasswordResetRequest should be defined', () => {
    expect(service.recordPasswordResetRequest).toBeDefined();
  });

  it('forgotPassword should be defined', () => {
    expect(service.forgotPassword).toBeDefined();
  });

  it('resetPasswordWithToken should be defined', () => {
    expect(service.resetPasswordWithToken).toBeDefined();
  });

  it('logout should be defined', () => {
    expect(service.logout).toBeDefined();
  });

  it('login should be defined', () => {
    expect(service.login).toBeDefined();
  });

  it('changePassword should be defined', () => {
    expect(service.changePassword).toBeDefined();
  });

  describe('checkIfAttemptsInLast24h', () => {
    it('does not throw an error when no timestamps are provided', () => {
      expect(() => service.checkIfAttemptsInLast24h([])).not.toThrow();
    });

    it('throws an error when more than two timestamps fall within a 24-hour period', () => {
      const now = new Date();
      expect(() =>
        service.checkIfAttemptsInLast24h([now, now, now]),
      ).toThrowErrorMatchingSnapshot('too many in 24 h');
    });

    it('does not throw an error when exactly two timestamps fall within a 24-hour period', () => {
      const now = new Date();
      expect(() => service.checkIfAttemptsInLast24h([now, now])).not.toThrow();
    });

    it('does not throw an error when input is undefined', () => {
      expect(() => service.checkIfAttemptsInLast24h(undefined)).not.toThrow();
    });

    it('does not throw an error when all timestamps are in the past', () => {
      const past = new Date(1999, 2, 20, 1, 50, 20);
      expect(() =>
        service.checkIfAttemptsInLast24h([past, past, past]),
      ).not.toThrow();
    });
  });

  describe('registerUser', () => {
    it('throws an error when password and repeat_password do not match', async () => {
      await expect(
        service.register({
          email: 'some@email.com',
          password: 'somepassword!',
          last_name: 'smith',
          first_name: 'john',
          repeat_password: 'somepassword',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('password mismatch');
    });

    it('throws an error when email is already registered', async () => {
      jest.spyOn(prismaService.users, 'count').mockResolvedValue(1);

      await expect(
        service.register({
          email: 'some@email.com',
          password: 'somepassword',
          last_name: 'smith',
          first_name: 'john',
          repeat_password: 'somepassword',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('email is already in use');
    });

    it('successfully creates a user when all validations pass', async () => {
      let result;
      jest
        .spyOn(prismaService.users, 'create')
        .mockImplementation(({ data }) => {
          result = data;
          return null;
        });

      await service.register({
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

    it('assigns role as customer even when email ends with +admin when auto-role is disabled', async () => {
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

      await service.register({
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

    it('assigns role as admin when email ends with +admin and auto-role is enabled', async () => {
      let result;
      jest
        .spyOn(prismaService.users, 'create')
        .mockImplementation(({ data }) => {
          result = data;
          return null;
        });

      jest.spyOn(configService, 'get').mockReturnValue('TRUE');

      await service.register({
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

    it('assigns role as manager when email ends with +manager and auto-role is enabled', async () => {
      let result;
      jest
        .spyOn(prismaService.users, 'create')
        .mockImplementation(({ data }) => {
          result = data;
          return null;
        });

      jest.spyOn(configService, 'get').mockReturnValue('TRUE');

      await service.register({
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

  describe('recordFailedLoginAttempt', () => {
    it('updates the database to append the current timestamp and retain only the latest three timestamps', async () => {
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

      await service.recordFailedLoginAttempt('some id', [past, past, past]);
      expect(result.failed_login_attempts_timestamps).toEqual([
        past,
        past,
        now,
      ]);
    });
  });

  describe('recordSuccessfulLoginAttempt', () => {
    it('sends a correctly structured update query to the database with the current timestamp and session token', async () => {
      let result;
      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        result = data;
        return null;
      });
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      await service.recordSuccessfulLoginAttempt('test_id', 'test_token');
      expect(result).toEqual({
        where: { id: 'test_id' },
        data: {
          login_at: now.toISOString(),
          session_token: 'test_token',
        },
      });
    });
  });

  describe('forgotPasswordRequest', () => {
    it('updates the database to append a new timestamp and retain only the latest three timestamps', async () => {
      let result;

      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        result = data;
        return null;
      });
      const past = new Date(1999, 2, 20, 1, 50, 20);
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await service.recordPasswordResetRequest(
        'some id',
        [past, past, past],
        'made up token',
      );
      expect(result).toMatchSnapshot('expected database update');
    });
  });

  describe('resetPassword', () => {
    it('updates the database with the new password', async () => {
      let result;

      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        data.data.password = expect.any(String);
        result = data;
        return null;
      });
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await service.resetPasswordWithToken('some id', 'the new password');
      expect(result).toMatchSnapshot('the expected database update');
    });

    it('ensures the password is hashed before being saved in the database', async () => {
      let result;

      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        result = data;
        return null;
      });
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await service.resetPasswordWithToken('some id', 'the new password');
      expect(result.data.password).not.toEqual('the new password');
    });
  });

  describe('logoutUser', () => {
    it('updates the database with a valid logout request for the user', async () => {
      let result;

      jest.spyOn(prismaService.users, 'update').mockImplementation((data) => {
        result = data;
        return null;
      });
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await service.logout('some id');
      expect(result).toMatchSnapshot('the expected database update');
    });
  });

  describe('loginUser', () => {
    it('throws an error when the email does not exist in the database', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockReset();
      await expect(
        service.login({
          email: 'some@email.com',
          password: 'some password',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('email not found response');
    });

    it('throws an error when the password is incorrect', async () => {
      // util is tested already.
      const util = jest
        .spyOn(service, 'checkIfAttemptsInLast24h')
        .mockImplementation(() => {});

      // tested already
      jest.spyOn(service, 'recordFailedLoginAttempt').mockResolvedValue(null);

      // hash of 'therightpassword'
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({
        id: 'test id',
        password:
          '$2y$10$Xzx25dxZ/cq0xn7toLj1HuZ1ZMfId8gRuR3VBGvX9fWdboh9xZrMa',
      } as Users);

      await expect(
        service.login({
          email: 'some@email.com',
          password: 'thewrongpassword',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('wrong password response');
      expect(util).toHaveBeenCalled();
    });

    it('returns a token and role when credentials are valid', async () => {
      // is already tested.
      jest
        .spyOn(service, 'checkIfAttemptsInLast24h')
        .mockImplementation(() => {});
      jest.spyOn(service, 'recordFailedLoginAttempt').mockResolvedValue(null);
      jest
        .spyOn(service, 'recordSuccessfulLoginAttempt')
        .mockResolvedValue(null);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('my_token');

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({
        id: 'test id',
        role: roles.customer,
        password:
          '$2b$10$fhpIpbwfaJlbiOZPDKlKxuV71lFjOk3EeX9npe.LSF0fIyiouR2i2',
      } as Users);

      await expect(
        service.login({
          email: 'some@email.com',
          password: 'therightpassword',
        }),
      ).resolves.toMatchSnapshot('ok response');
    });
  });

  describe('forgotPassword', () => {
    it('returns a status message with a reset token', async () => {
      // is already tested.
      jest
        .spyOn(service, 'checkIfAttemptsInLast24h')
        .mockImplementation(() => {});
      jest.spyOn(service, 'recordPasswordResetRequest').mockResolvedValue({
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

  describe('changePassword', () => {
    it('throws an error when the password and repeat password do not match', async () => {
      await expect(
        service.changePassword({
          password: 'a',
          repeat_password: 'b',
          reset_token: 'my_token',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('mismatch password response');
    });

    it('throws an error when the token is malformed', async () => {
      await expect(
        service.changePassword({
          password: 'a',
          repeat_password: 'a',
          reset_token: 'my_token',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('token is malformed');
    });

    it('throws an error when the token is invalid', async () => {
      await expect(
        service.changePassword({
          password: 'a',
          repeat_password: 'a',
          reset_token:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MzU5NDAyMzYsImV4cCI6MTc2NzQ3NjIzNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.vwn02EWxfKdm0bVyaLFQVpTWevnsEah5lRu_gU27vCk',
        }),
      ).rejects.toThrowErrorMatchingSnapshot('token is invalid');
    });

    it("throws an error when the token payload does not match the user's current token (e.g., token reused or invalidated)", async () => {
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

    it('returns a success message when the password is successfully reset', async () => {
      // is already tested.
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ user: 'some_user_id' });
      jest.spyOn(usersService, 'findOneByID').mockResolvedValue({
        password_reset_token: 'my_token',
      } as Users);
      jest.spyOn(service, 'resetPasswordWithToken').mockResolvedValue({
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
