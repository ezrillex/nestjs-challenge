import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignupUserDto } from '../../DTOs/signup-user-dto/signup-user-dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: SignupUserDto) {
    const duplicate = await this.prisma.users.findUnique({
      where: { email: data.email },
    });
    if (duplicate) {
      throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
    }

    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.users.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: hashed,
      },
    });
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
    // Is it ok to recycle the data the controller already has, I just sent it this, requesting it would be extra db load
    //const user = await this.prisma.users.findUnique({where: {id: id}});

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

  async loginAttemptSuccess(id: string) {
    const now = new Date().toISOString();
    // truly I don't need to store the token in the db.
    // I only need to check if login timestamp is older than last logout timestamp to determine if token is not valid anymore
    // thus only need to update this:
    return this.prisma.users.update({
      where: { id: id },
      data: { last_login_at: now },
    });
  }

  async forgotPasswordRequest(
    id: string,
    timestamps: Date[],
    resetToken: string,
  ) {
    // Is it ok to recycle the data the controller already has, I just sent it this, requesting it would be extra db load
    //const user = await this.prisma.users.findUnique({where: {id: id}});

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
}
