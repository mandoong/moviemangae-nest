import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common/decorators';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/all')
  getAllUser() {
    return this.userService.getAllUser();
  }

  @Get('/find/:id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @Get('/profile')
  @UseGuards(AuthGuard())
  getMyProfile(@Req() req: Request) {
    return this.userService.getMyProfile(req);
  }
}