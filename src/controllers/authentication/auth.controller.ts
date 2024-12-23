import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SignupUserDto } from '../../DTOs/signup-user-dto/signup-user-dto';
import { AuthService } from '../../services/authentication/auth.service';
import { LoginUserDto } from '../../DTOs/login-user-dto/login-user-dto';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DateTime } from 'luxon';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Get('test')
  async test() {
    const now = DateTime.now();

    console.log(now);
    return 'ok';
  }

  @Post('signup')
  async signup(@Body() data: SignupUserDto) {
    if (data.password !== data.repeat_password) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }

    const created_user = await this.authService.createUser(data);
    console.log('SEND WELCOME EMAIL');
    return {
      id: created_user.id,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() data: LoginUserDto) {
    const user = await this.authService.findOneByEmail(data.email);

    // account locked check
    if (user.failed_login_attempts >= 3) {
      const aDayAgo = DateTime.now().minus({ days: 1 });

      const isIn24h = user.failed_login_attempts_timestamps.reduce(
        (accumulator, current) => {
          const value = DateTime.fromISO(current.toISOString());
          accumulator = accumulator === value >= aDayAgo; // basically an AND of whole array to check if is past 24 hours.
          return accumulator;
        },
        true,
      );

      if (isIn24h) {
        throw new HttpException(
          'Too many failed login attempts, account is locked. Try again later.',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const isCorrectPassword = await bcrypt.compare(
      data.password,
      user.password,
    );
    if (isCorrectPassword) {
      const token = this.jwtService.sign({
        user: user.id,
        role: user.role,
      });
      await this.authService.loginAttemptSuccess(user.id);
      return { token };
    } else {
      await this.authService.loginAttemptFailed(
        user.id,
        user.failed_login_attempts_timestamps,
      );
      console.log(' SEND LOGIN UNSUCCESFULL EMAIL ');
      throw new HttpException(
        'Wrong password. Try again or use the forgot password api to reset it.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
