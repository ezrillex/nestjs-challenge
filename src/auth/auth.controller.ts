import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user-dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { Public } from '../common/decorators/public.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() data: SignupUserDto) {
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
    this.authService.util_isIn24h(
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

      await this.authService.loginAttemptSuccess(user.id, token);
      return { token, role: user.role };
    } else {
      await this.authService.loginAttemptFailed(
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

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Request() request: Request) {
    const userId = request['user'].id;
    return this.authService.logoutUser(userId);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot')
  async forgot(@Body() data: ForgotPasswordDto) {
    const user = await this.authService.findOneByEmail(data.email);

    // too many reset attempts check
    this.authService.util_isIn24h(
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
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @Post('reset')
  async reset(@Body() data: ResetPasswordDto) {
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

  // For frontend, I guess
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUser(@Request() req: Request) {
    const u = req['user'];
    return {
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role,
    };
  }
}
