import { Request, Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('users')
export class UsersController {
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
