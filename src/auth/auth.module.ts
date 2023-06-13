import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './gogle.strategy';
import { User } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { KakaoStrategy } from './kakao.strategy';
import { NaverStrategy } from './naver.strategy';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: 60 * 60,
      },
    }),
    TypeOrmModule.forFeature([User, UserRepository]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    GoogleStrategy,
    KakaoStrategy,
    NaverStrategy,
  ],
})
export class AuthModule {}
