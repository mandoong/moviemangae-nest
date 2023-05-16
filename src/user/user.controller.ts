import { Body, Controller, Get, Param, Post } from '@nestjs/common/decorators';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ParseIntPipe } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/all')
  getAllUser() {
    return this.userService.getAllUser();
  }

  @Get('/:id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }
}
