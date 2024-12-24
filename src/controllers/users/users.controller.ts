import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers() {
    return 'Hello World!';
  }
}
