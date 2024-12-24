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
import { ForgotPasswordDto } from '../../DTOs/forgot-password-dto/forgot-password-dto';
import { ResetPasswordDto } from '../../DTOs/reset-password-dto/reset-password-dto';
import { Public } from '../../decorators/public/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  /*
   @description method throws error if timestamps are in 24-hour period.
   @param timestamps an array of timestamps
   @param message customize the error message
   @param status customize the http status code
   @param throwError disable throwing error
   @returns a boolean value of true if all timestamps are in last 24 hours
   */
  private util_isIn24h(
    timestamps: Date[],
    message: string = 'Too many attempts in 24 hour period.',
    status: HttpStatus = HttpStatus.FORBIDDEN,
    throwError: boolean = true,
  ) {
    // account locked check
    if (timestamps.length >= 3) {
      const aDayAgo = DateTime.now().minus({ days: 1 });

      const isIn24h = timestamps.reduce((accumulator, current) => {
        const value = DateTime.fromISO(current.toISOString());
        accumulator = accumulator === value >= aDayAgo; // basically an AND of whole array to check if is past 24 hours.
        return accumulator;
      }, true);

      if (isIn24h && throwError) {
        throw new HttpException(message, status);
      }

      return isIn24h;
    }
  }

  @Public()
  @Get('test')
  async test() {
    const now = DateTime.now();

    console.log(now);
    return 'ok';
  }

  @Public()
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

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() data: LoginUserDto) {
    const user = await this.authService.findOneByEmail(data.email);

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

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot')
  async forgot(@Body() data: ForgotPasswordDto) {
    const user = await this.authService.findOneByEmail(data.email);

    // too many reset attempts check
    this.util_isIn24h(
      user.password_reset_requests_timestamps,
      'Too many password reset requests in a 24 hour period. Try again later.',
    );

    const token = this.jwtService.sign({
      user: user.id,
    });

    await this.authService.forgotPasswordRequest(
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

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset')
  async reset(@Body() data: ResetPasswordDto) {
    if (data.password !== data.repeat_password) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }

    const payload = await this.jwtService.verifyAsync(data.reset_token);
    const user = await this.authService.findOneByID(payload.user);

    if (user.password_reset_token === data.reset_token) {
      await this.authService.resetPassword(user.id, data.password);
      return {
        message: 'The password has been reset successfully!',
      };
    } else {
      throw new HttpException('The token is not valid.', HttpStatus.FORBIDDEN);
    }
  }

  // @HttpCode(HttpStatus.OK)
  // @Get()
}
