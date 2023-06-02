import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: UserRepository,
  ) {}

  async getAllUser(page: number) {
    const result = await this.userRepository.find({ take: 30, skip: page });

    return result;
  }
  async getUser(id: number) {
    const result = await this.userRepository.findOne({ where: { id: id } });

    if (!result) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    return result;
  }

  async getMyProfile(req) {
    const { email } = req.user;
    console.log(email);
    const profile = await this.userRepository.findOne({
      where: { email: email },
      relations: {
        likeMovie: true,
      },
    });

    return profile;
  }
}
