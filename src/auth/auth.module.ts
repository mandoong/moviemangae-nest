import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './gogle.strategy';
import { User } from 'src/user/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { KakaoStrategy } from './kakao.strategy';
import { NaverStrategy } from './naver.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  exports: [
    JwtStrategy,
    GoogleStrategy,
    PassportModule,
    KakaoStrategy,
    NaverStrategy,
  ],
})
export class AuthModule {}
