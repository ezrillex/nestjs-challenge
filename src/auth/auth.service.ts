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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly emailsService: EmailsService,
  ) {}

  /*
   @description method throws error if timestamps are in 24-hour period.
   @param timestamps an array of timestamps
   @param message customize the error message
   @param status customize the http status code
   */
  util_isIn24h(
    timestamps: Date[],
    message: string = 'Too many attempts in 24 hour period.',
    status: HttpStatus = HttpStatus.FORBIDDEN,
  ) {
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

  async createUser(data: SignupUserDto) {
    if (data.password !== data.repeat_password) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }

    let role: roles = roles.customer;
    if (this.configService.get<string>('AUTO_ROLE') === 'TRUE') {
      if (data.email.startsWith('admin')) {
        role = roles.admin;
      } else if (data.email.startsWith('manager')) {
        role = roles.manager;
      }
    }

    const duplicate = await this.prisma.users.count({
      where: { email: data.email },
    });
    if (duplicate > 0) {
      throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = this.prisma.users.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: hashed,
        role: role,
      },
    });

    await this.emailsService.sendEmail(EMAIL_TEMPLATE.WELCOME, {
      user_first_name: data.first_name,
    });

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email: email },
    });
    if (user) {
      return user;
    } else {
      throw new HttpException(
        "Couldn't find your account. Make sure this is the right email.",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findOneByID(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: id },
    });
    if (user) {
      return user;
    } else {
      throw new HttpException(
        "Couldn't find an account with the associated id .",
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async loginAttemptFailed(id: string, timestamps: Date[]) {
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

  async loginAttemptSuccess(id: string, token: string) {
    const now = new Date().toISOString();
    return this.prisma.users.update({
      where: { id: id },
      data: { login_at: now, session_token: token },
    });
  }

  async forgotPasswordRequest(
    id: string,
    timestamps: Date[],
    resetToken: string,
  ) {
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

  async forgotPassword(data: ForgotPasswordDto) {
    const user = await this.findOneByEmail(data.email);

    // too many reset attempts check
    this.util_isIn24h(
      user.password_reset_requests_timestamps,
      'Too many password reset requests in a 24 hour period. Try again later.',
    );

    const token = this.jwtService.sign({
      user: user.id,
    });

    await this.forgotPasswordRequest(
      user.id,
      user.password_reset_requests_timestamps,
      token,
    );

    console.log('SEND EMAIL WITH TOKEN: ', token);
    return {
      message:
        'An email has been sent with a link to reset the password. Check your email.',
    };
  }

  async resetPassword(id: string, new_password: string) {
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

  async logoutUser(id: string) {
    const now = new Date().toISOString();
    return this.prisma.users.update({
      where: { id: id },
      data: {
        session_token: null,
        logout_at: now,
      },
    });
  }

  async loginUser(data: LoginUserDto) {
    const user = await this.findOneByEmail(data.email);

    // account locked check
    this.util_isIn24h(
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

      const success = await this.loginAttemptSuccess(user.id, token);
      console.log(' SEND LOGIN SUCESS EMAIL ');
      return { token, role: user.role };
    } else {
      const failed = await this.loginAttemptFailed(
        user.id,
        user.failed_login_attempts_timestamps,
      );
      console.log(' SEND LOGIN UNSUCCESSFUL EMAIL ');
      throw new HttpException(
        'Wrong password. Try again or use the forgot password api to reset it.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async changePassword(data: ResetPasswordDto) {
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
    const user = await this.findOneByID(payload.user);

    if (user.password_reset_token === data.reset_token) {
      await this.resetPassword(user.id, data.password);
      return {
        message: 'The password has been reset successfully!',
      };
    } else {
      throw new HttpException('The token is not valid.', HttpStatus.FORBIDDEN);
    }
  }
}
