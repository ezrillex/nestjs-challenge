import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { roles, Users } from '@prisma/client';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EMAIL_TEMPLATE, EmailsService } from '../emails/emails.service';
import { DateTime } from 'luxon';
import { SignupUserDto } from './dto/signup-user.dto';
import { faker } from '@faker-js/faker';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

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
  let emailsService: EmailsService;
  let testUser: Users;

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
    emailsService = module.get(EmailsService);

    testUser = {
      id: faker.string.uuid(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.string.alphanumeric(60),
      created_at: new Date(),
      role: roles.customer,
      failed_login_attempts: 0,
      failed_login_attempts_timestamps: [new Date()],
      session_token: faker.internet.jwt(),
      login_at: null,
      logout_at: null,
      password_reset_requests: 0,
      password_reset_requests_timestamps: [],
      password_reset_token: faker.string.alphanumeric(60),
      password_last_updated: new Date(),
    };
  });

  it('should be defined', () => {
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

  describe('checkIfAttemptsInLast24h', () => {
    it('checkIfAttemptsInLast24h should be defined', () => {
      expect(service.checkIfAttemptsInLast24h).toBeDefined();
    });

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

    it('does not throw an error when timestamps are just outside the 24-hour window', () => {
      const aDayAgoAndAMinute = DateTime.now()
        .minus({ day: 1, minute: 1 })
        .toJSDate();
      expect(() =>
        service.checkIfAttemptsInLast24h([
          aDayAgoAndAMinute,
          aDayAgoAndAMinute,
          aDayAgoAndAMinute,
        ]),
      ).not.toThrow();
    });
  });

  describe('register', () => {
    it('register should be defined', () => {
      expect(service.register).toBeDefined();
    });

    it('throws an error when password and repeat_password do not match', async () => {
      const input: SignupUserDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        last_name: faker.person.lastName(),
        first_name: faker.person.firstName(),
        repeat_password: faker.internet.password(),
      };

      await expect(service.register(input)).rejects.toThrow(
        new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST),
      );
    });

    it('throws an error when email is already registered', async () => {
      const spy = jest.spyOn(prismaService.users, 'count').mockResolvedValue(1);

      const password = faker.internet.password();
      const input: SignupUserDto = {
        email: testUser.email,
        password,
        last_name: testUser.last_name,
        first_name: testUser.first_name,
        repeat_password: password,
      };

      await expect(service.register(input)).rejects.toThrow(
        new HttpException('Email is already in use', HttpStatus.CONFLICT),
      );
      expect(spy).toHaveBeenCalledWith({
        where: { email: input.email },
      });
    });

    it('successfully creates a user when all validations pass', async () => {
      const password = faker.internet.password();
      const input: SignupUserDto = {
        email: faker.internet.email(),
        password,
        last_name: faker.person.lastName(),
        first_name: faker.person.firstName(),
        repeat_password: password,
      };

      const cryptoSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(async () => testUser.password);

      const spy = jest
        .spyOn(prismaService.users, 'create')
        .mockResolvedValue(testUser);

      await expect(service.register(input)).resolves.toEqual(testUser);

      expect(spy).toHaveBeenCalledWith({
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email,
          password: testUser.password,
          role: roles.customer,
        },
        select: {
          id: true,
          email: true,
          role: true,
          last_name: true,
          first_name: true,
          created_at: true,
        },
      });
      expect(cryptoSpy).toHaveBeenCalledWith(password, 10);
    });

    it('assigns role as customer even when email ends with +admin when auto-role is disabled', async () => {
      const previous = faker.internet.email().split('@');
      const email = `${previous[0]}+admin@${previous[1]}`;
      const password = faker.internet.password();
      const input: SignupUserDto = {
        email,
        password,
        last_name: faker.person.lastName(),
        first_name: faker.person.firstName(),
        repeat_password: password,
      };

      jest.spyOn(configService, 'get').mockImplementation(() => {
        return 'FALSE';
      });

      const cryptoSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(async () => testUser.password);

      const spy = jest
        .spyOn(prismaService.users, 'create')
        .mockResolvedValue(testUser);

      await expect(service.register(input)).resolves.toEqual(testUser);

      expect(spy).toHaveBeenCalledWith({
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email,
          password: testUser.password,
          role: roles.customer,
        },
        select: {
          id: true,
          email: true,
          role: true,
          last_name: true,
          first_name: true,
          created_at: true,
        },
      });
      expect(cryptoSpy).toHaveBeenCalledWith(password, 10);
    });

    it.each([roles.admin, roles.manager])(
      'assigns role as [admin,manager] when email ends with +[admin,manager] and auto-role is enabled',
      async (roleParameter) => {
        const previous = faker.internet.email().split('@');
        const email = `${previous[0]}+${roleParameter}@${previous[1]}`;
        const password = faker.internet.password();
        const input: SignupUserDto = {
          email,
          password,
          last_name: faker.person.lastName(),
          first_name: faker.person.firstName(),
          repeat_password: password,
        };

        jest.spyOn(configService, 'get').mockImplementation(() => {
          return 'TRUE';
        });

        const cryptoSpy = jest
          .spyOn(bcrypt, 'hash')
          .mockImplementationOnce(async () => testUser.password);

        const spy = jest
          .spyOn(prismaService.users, 'create')
          .mockResolvedValue(testUser);

        await expect(service.register(input)).resolves.toEqual(testUser);

        expect(spy).toHaveBeenCalledWith({
          data: {
            first_name: input.first_name,
            last_name: input.last_name,
            email: input.email,
            password: testUser.password,
            role: roleParameter,
          },
          select: {
            id: true,
            email: true,
            role: true,
            last_name: true,
            first_name: true,
            created_at: true,
          },
        });
        expect(cryptoSpy).toHaveBeenCalledWith(password, 10);
      },
    );
  });

  describe('recordFailedLoginAttempt', () => {
    it('recordFailedLoginAttempt should be defined', () => {
      expect(service.recordFailedLoginAttempt).toBeDefined();
    });

    it('updates the database to append the current timestamp and retain only the latest three timestamps', async () => {
      const spyUpdate = jest
        .spyOn(prismaService.users, 'update')
        .mockResolvedValue(testUser);
      const past = new Date(1999, 2, 20, 1, 50, 20);
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await expect(
        service.recordFailedLoginAttempt(testUser.id, [past, past, past]),
      ).resolves.toEqual(testUser);
      expect(spyUpdate).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: {
          failed_login_attempts: 3,
          failed_login_attempts_timestamps: [past, past, now],
        },
      });
    });
  });

  describe('recordSuccessfulLoginAttempt', () => {
    it('recordSuccessfulLoginAttempt should be defined', () => {
      expect(service.recordSuccessfulLoginAttempt).toBeDefined();
    });

    it('sends a correctly structured update query to the database with the current timestamp and session token', async () => {
      const updateSpy = jest
        .spyOn(prismaService.users, 'update')
        .mockResolvedValue(testUser);
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      await expect(
        service.recordSuccessfulLoginAttempt(
          testUser.id,
          testUser.session_token,
        ),
      ).resolves.toEqual(testUser);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: {
          login_at: now.toISOString(),
          session_token: testUser.session_token,
        },
      });
    });
  });

  describe('forgotPasswordRequest', () => {
    it('recordPasswordResetRequest should be defined', () => {
      expect(service.recordPasswordResetRequest).toBeDefined();
    });

    it('updates the database to append a new timestamp and retain only the latest three timestamps', async () => {
      const updateSpy = jest
        .spyOn(prismaService.users, 'update')
        .mockResolvedValue(testUser);
      const past = new Date(1999, 2, 20, 1, 50, 20);
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await expect(
        service.recordPasswordResetRequest(
          testUser.id,
          [past, past, past],
          testUser.password_reset_token,
        ),
      ).resolves.toEqual(testUser);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: {
          password_reset_requests: 3,
          password_reset_requests_timestamps: [past, past, now],
          password_reset_token: testUser.password_reset_token,
        },
      });
    });
  });

  describe('resetPassword', () => {
    it('resetPassword should be defined', () => {
      expect(service.resetPassword).toBeDefined();
    });

    it('updates the database with the new hashed password', async () => {
      const updateSpy = jest
        .spyOn(prismaService.users, 'update')
        .mockResolvedValue(testUser);
      const cryptoSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(async () => {
          return testUser.password;
        });
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      const newPassword = faker.internet.password();
      await expect(
        service.resetPassword(testUser.id, newPassword),
      ).resolves.toEqual(testUser);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: {
          password: testUser.password,
          password_last_updated: new Date(),
          password_reset_token: null,
          // clear previous attempts
          password_reset_requests: 0,
          password_reset_requests_timestamps: [],
          // unlocks account
          failed_login_attempts: 0,
          failed_login_attempts_timestamps: [],
        },
      });
      expect(cryptoSpy).toHaveBeenCalledWith(newPassword, 10);
    });
  });

  describe('logout', () => {
    it('logout should be defined', () => {
      expect(service.logout).toBeDefined();
    });

    it('updates the database with a valid logout request for the user', async () => {
      const updateSpy = jest
        .spyOn(prismaService.users, 'update')
        .mockResolvedValue(testUser);
      const now = new Date(2020, 12, 30, 1, 45, 50);
      jest.useFakeTimers().setSystemTime(now);

      await expect(service.logout(testUser.id)).resolves.toEqual(testUser);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: {
          session_token: null,
          logout_at: now.toISOString(),
        },
      });
    });
  });

  describe('login', () => {
    it('login should be defined', () => {
      expect(service.login).toBeDefined();
    });

    it('throws an error when the email does not exist in the database', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockReset();
      const emailSpy = jest.spyOn(usersService, 'getUserByEmail');
      const password = faker.internet.password();
      await expect(
        service.login({
          email: testUser.email,
          password,
        }),
      ).rejects.toThrow(
        new HttpException(
          "Couldn't find your account. Make sure this is the right email.",
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(emailSpy).toHaveBeenCalledWith(testUser.email);
    });
    // todo EXAMPLE OF SIDE EFFECTS ASSERTION FIRST WHEN ERROR
    it('throws an error when the password is incorrect', async () => {
      const emailSpy = jest
        .spyOn(usersService, 'getUserByEmail')
        .mockResolvedValue(testUser);

      const utilSpy = jest.spyOn(service, 'checkIfAttemptsInLast24h');
      const cryptoSpy = jest.spyOn(bcrypt, 'compare');

      const recordSpy = jest
        .spyOn(service, 'recordFailedLoginAttempt')
        .mockResolvedValue(testUser);

      const mailerSpy = jest
        .spyOn(emailsService, 'sendEmail')
        .mockResolvedValue();

      const password = faker.internet.password();
      let error;
      try {
        await service.login({
          email: testUser.email,
          password,
        });
      } catch (e) {
        error = e;
      }

      expect(emailSpy).toHaveBeenCalledWith(testUser.email);
      expect(utilSpy).toHaveBeenCalledWith(
        testUser.failed_login_attempts_timestamps,
        'Too many failed login attempts, account is locked. Try again later.',
      );
      expect(cryptoSpy).toHaveBeenCalledWith(password, testUser.password);
      await expect(cryptoSpy.mock.results[0].value).resolves.toBe(false);
      expect(recordSpy).toHaveBeenCalledWith(
        testUser.id,
        testUser.failed_login_attempts_timestamps,
      );
      expect(mailerSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE.LOGIN_FAIL);
      expect(error).toEqual(
        new HttpException(
          'Wrong password. Try again or use the forgot password api to reset it.',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
    // todo SAMPLE OF SIDE EFFECTS FIRST
    it('returns a token and role when credentials are valid', async () => {
      testUser.password = await bcrypt.hash('therightpassword', 10);
      const emailSpy = jest
        .spyOn(usersService, 'getUserByEmail')
        .mockResolvedValue(testUser);

      const utilSpy = jest.spyOn(service, 'checkIfAttemptsInLast24h');
      const cryptoSpy = jest.spyOn(bcrypt, 'compare');

      const jwtSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(testUser.session_token);

      const recordSpy = jest
        .spyOn(service, 'recordSuccessfulLoginAttempt')
        .mockResolvedValue(testUser);

      const mailerSpy = jest
        .spyOn(emailsService, 'sendEmail')
        .mockResolvedValue();

      const password = 'therightpassword';
      const test = await service.login({
        email: testUser.email,
        password,
      });
      expect(jwtSpy).toHaveBeenCalledWith({
        user: testUser.id,
        role: testUser.role,
      });
      expect(emailSpy).toHaveBeenCalledWith(testUser.email);
      expect(utilSpy).toHaveBeenCalledWith(
        testUser.failed_login_attempts_timestamps,
        'Too many failed login attempts, account is locked. Try again later.',
      );
      expect(cryptoSpy).toHaveBeenCalledWith(password, testUser.password);
      await expect(cryptoSpy.mock.results[0].value).resolves.toBe(true);
      expect(recordSpy).toHaveBeenCalledWith(
        testUser.id,
        testUser.session_token,
      );
      expect(mailerSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE.LOGIN_SUCCESSFUL);
      expect(test).toEqual({
        id: testUser.id,
        token: testUser.session_token,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        email: testUser.email,
        created_at: testUser.created_at,
        role: testUser.role,
        login_at: testUser.login_at,
        password_last_updated: testUser.password_last_updated,
      });
    });
  });

  describe('forgotPassword', () => {
    it('forgotPassword should be defined', () => {
      expect(service.forgotPassword).toBeDefined();
    });

    it('returns a status message with a reset token', async () => {
      const mailSpy = jest
        .spyOn(usersService, 'getUserByEmail')
        .mockResolvedValue(testUser);
      const utilSpy = jest
        .spyOn(service, 'checkIfAttemptsInLast24h')
        .mockImplementation(() => {});

      const resetToken = faker.internet.jwt();
      const jwtSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(resetToken);

      const recordspy = jest
        .spyOn(service, 'recordPasswordResetRequest')
        .mockResolvedValue(testUser);

      const mailerSpy = jest
        .spyOn(emailsService, 'sendEmail')
        .mockResolvedValue();

      const test = await service.forgotPassword({
        email: testUser.email,
      });

      expect(mailSpy).toHaveBeenCalledWith(testUser.email);
      expect(utilSpy).toHaveBeenCalledWith(
        testUser.password_reset_requests_timestamps,
        'Too many password reset requests in a 24 hour period. Try again later.',
      );
      expect(jwtSpy).toHaveBeenCalledWith({ user: testUser.id });
      expect(recordspy).toHaveBeenCalledWith(
        testUser.id,
        testUser.password_reset_requests_timestamps,
        resetToken,
      );
      expect(mailerSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE.FORGOT_PASSWORD, {
        reset_token: resetToken,
      });

      expect(test).toEqual({
        message:
          'An email has been sent with a link to reset the password. Check your email.',
        request_count: testUser.password_reset_requests,
        request_timestamps: testUser.password_reset_requests_timestamps,
      });
    });
  });

  describe('changePassword', () => {
    it('changePassword should be defined', () => {
      expect(service.changePassword).toBeDefined();
    });

    it('throws an error when the password and repeat password do not match', async () => {
      await expect(
        service.changePassword({
          password: faker.internet.password(),
          repeat_password: faker.internet.password(),
          reset_token: faker.internet.jwt(),
        }),
      ).rejects.toThrow(
        new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST),
      );
    });

    it('throws an error when the token is malformed', async () => {
      const password = faker.internet.password();

      await expect(
        service.changePassword({
          password: password,
          repeat_password: password,
          reset_token: faker.string.alphanumeric(60),
        }),
      ).rejects.toThrowErrorMatchingSnapshot('token is malformed');
    });

    it('throws an error when the token is invalid', async () => {
      const password = faker.internet.password();
      await expect(
        service.changePassword({
          password: password,
          repeat_password: password,
          reset_token:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MzU5NDAyMzYsImV4cCI6MTc2NzQ3NjIzNiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.vwn02EWxfKdm0bVyaLFQVpTWevnsEah5lRu_gU27vCk',
        }),
      ).rejects.toThrow(
        new HttpException(
          `An error occurred when validating reset token: invalid signature`,
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it("throws an error when the token payload does not match the user's current token (e.g., token reused or invalidated)", async () => {
      const jwtSpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ user: testUser.id, role: testUser.role });

      const userSpy = jest
        .spyOn(usersService, 'getUserById')
        .mockResolvedValue(testUser);
      const password = faker.internet.password();
      const token = faker.internet.jwt();
      await expect(
        service.changePassword({
          password: password,
          repeat_password: password,
          reset_token: token,
        }),
      ).rejects.toThrow(
        new HttpException('The token is not valid.', HttpStatus.FORBIDDEN),
      );

      expect(jwtSpy).toHaveBeenCalledWith(token);
      expect(userSpy).toHaveBeenCalledWith(testUser.id);
    });

    it('returns a success message when the password is successfully reset', async () => {
      const jwtSpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ user: testUser.id, role: testUser.role });

      const resetSpy = jest
        .spyOn(service, 'resetPassword')
        .mockResolvedValue(testUser);

      const userSpy = jest
        .spyOn(usersService, 'getUserById')
        .mockResolvedValue(testUser);
      const password = faker.internet.password();
      await expect(
        service.changePassword({
          password: password,
          repeat_password: password,
          reset_token: testUser.password_reset_token,
        }),
      ).resolves.toEqual({
        message: 'The password has been reset successfully!',
        password_last_updated: testUser.password_last_updated,
      });

      expect(jwtSpy).toHaveBeenCalledWith(testUser.password_reset_token);
      expect(userSpy).toHaveBeenCalledWith(testUser.id);
      expect(resetSpy).toHaveBeenCalledWith(testUser.id, password);
    });
  });
});
