import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() data: SignupUserDto) {
    const created_user = await this.authService.registerUser(data);
    return created_user;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() data: LoginUserDto) {
    return this.authService.loginUser(data);
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
    return this.authService.forgotPassword(data);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @Post('reset')
  async reset(@Body() data: ResetPasswordDto) {
    return this.authService.changePassword(data);
  }
}
