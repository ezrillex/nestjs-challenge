import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { roles } from '@prisma/client';
import { DateTime } from 'luxon';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EMAIL_TEMPLATE, EmailsService } from '../emails/emails.service';
import { UsersService } from '../users/users.service';
import { Users } from '../users/users.model';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { ResetPasswordResponseDto } from './dto/ResetPasswordResponse.dto';

// todo refactor all specific user related operations to user service.
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly emailsService: EmailsService,
    private readonly usersService: UsersService,
  ) {}

  /*
   @description method throws error if timestamps are in 24-hour period.
   @param timestamps an array of timestamps
   @param message customize the error message
   @param status customize the http status code
   */
  checkIfAttemptsInLast24h(
    timestamps: Date[],
    message: string = 'Too many attempts in 24 hour period.',
    status: HttpStatus = HttpStatus.FORBIDDEN,
  ): void {
    // account locked check
    if (timestamps && timestamps.length >= 3) {
      const aDayAgo = DateTime.now().minus({ days: 1 });

      const isIn24h = timestamps.reduce((accumulator, current) => {
        const value = DateTime.fromISO(current.toISOString());
        accumulator = accumulator === value >= aDayAgo; // basically an AND of whole array to check if is past 24 hours.
        return accumulator;
      }, true);

      if (isIn24h) {
        throw new HttpException(message, status);
      }
    }
  }

  async register(data: SignupUserDto): Promise<Users> {
    if (data.password !== data.repeat_password) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }

    const duplicate = await this.prisma.users.count({
      where: { email: data.email },
    });
    if (duplicate > 0) {
      throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
    }

    const hashed = await bcrypt.hash(data.password, 10);
    let role: roles = roles.customer;
    if (this.configService.get<string>('AUTO_ROLE') === 'TRUE') {
      const email = data.email.split('@');
      const suffix = email[0].split('+');
      if (suffix.length > 1) {
        if (suffix.at(-1) === 'admin') {
          role = roles.admin;
        } else if (suffix.at(-1) === 'manager') {
          role = roles.manager;
        }
      }
    }

    const user = this.prisma.users.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: hashed,
        role,
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

    await this.emailsService.sendEmail(EMAIL_TEMPLATE.WELCOME, {
      user_first_name: data.first_name,
    });

    return user;
  }

  async recordFailedLoginAttempt(
    id: string,
    timestamps: Date[],
  ): Promise<Users> {
    const ts_length = timestamps.push(new Date());
    if (ts_length > 3) {
      timestamps.shift();
    }

    return this.prisma.users.update({
      where: { id: id },
      data: {
        failed_login_attempts: timestamps.length,
        failed_login_attempts_timestamps: timestamps,
      },
    });
  }

  async recordSuccessfulLoginAttempt(
    id: string,
    token: string,
  ): Promise<Users> {
    const now = new Date().toISOString();
    return this.prisma.users.update({
      where: { id: id },
      data: { login_at: now, session_token: token },
    });
  }

  async recordPasswordResetRequest(
    id: string,
    timestamps: Date[],
    resetToken: string,
  ): Promise<Users> {
    const ts_length = timestamps.push(new Date());
    if (ts_length > 3) {
      timestamps.shift();
    }

    return this.prisma.users.update({
      where: { id: id },
      data: {
        password_reset_requests: timestamps.length,
        password_reset_requests_timestamps: timestamps,
        password_reset_token: resetToken,
      },
    });
  }

  async forgotPassword(
    data: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    const user = await this.usersService.findOneByEmail(data.email);

    // too many reset attempts check
    this.checkIfAttemptsInLast24h(
      user.password_reset_requests_timestamps,
      'Too many password reset requests in a 24 hour period. Try again later.',
    );

    const token = this.jwtService.sign({
      user: user.id,
    });

    const forgotPasswordData = await this.recordPasswordResetRequest(
      user.id,
      user.password_reset_requests_timestamps,
      token,
    );

    await this.emailsService.sendEmail(EMAIL_TEMPLATE.FORGOT_PASSWORD, {
      reset_token: token,
    });

    return {
      message:
        'An email has been sent with a link to reset the password. Check your email.',
      request_count: forgotPasswordData.password_reset_requests,
      request_timestamps: forgotPasswordData.password_reset_requests_timestamps,
    };
  }

  async resetPasswordWithToken(
    id: string,
    new_password: string,
  ): Promise<Users> {
    const hashed = await bcrypt.hash(new_password, 10);

    return this.prisma.users.update({
      where: { id: id },
      data: {
        password: hashed,
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
  }

  async logout(id: string): Promise<Users> {
    const now = new Date().toISOString();
    return this.prisma.users.update({
      where: { id: id },
      data: {
        session_token: null,
        logout_at: now,
      },
    });
  }

  async login(data: LoginUserDto): Promise<Users & { token: string }> {
    const user = await this.usersService.findOneByEmail(data.email);

    // account locked check
    this.checkIfAttemptsInLast24h(
      user.failed_login_attempts_timestamps,
      'Too many failed login attempts, account is locked. Try again later.',
    );
    const isCorrectPassword = await bcrypt.compare(
      data.password,
      user.password,
    );
    if (isCorrectPassword) {
      const token = await this.jwtService.signAsync({
        user: user.id,
        role: user.role,
      });

      await this.recordSuccessfulLoginAttempt(user.id, token);
      await this.emailsService.sendEmail(EMAIL_TEMPLATE.LOGIN_SUCCESSFUL);
      return {
        id: user.id,
        token,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        created_at: user.created_at,
        role: user.role,
        login_at: user.login_at,
        password_last_updated: user.password_last_updated,
      };
    } else {
      await this.recordFailedLoginAttempt(
        user.id,
        user.failed_login_attempts_timestamps,
      );
      await this.emailsService.sendEmail(EMAIL_TEMPLATE.LOGIN_FAIL);
      throw new HttpException(
        'Wrong password. Try again or use the forgot password api to reset it.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async changePassword(
    data: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    if (data.password !== data.repeat_password) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }
    let payload: { user: string };
    try {
      payload = await this.jwtService.verifyAsync(data.reset_token);
    } catch (error) {
      throw new HttpException(
        `An error occurred when validating reset token: ${error.message}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { password_reset_token, id } = await this.usersService.findOneByID(
      payload.user,
    );

    if (password_reset_token === data.reset_token) {
      const { password_last_updated } = await this.resetPasswordWithToken(
        id,
        data.password,
      );
      return {
        message: 'The password has been reset successfully!',
        password_last_updated,
      };
    } else {
      throw new HttpException('The token is not valid.', HttpStatus.FORBIDDEN);
    }
  }
}
