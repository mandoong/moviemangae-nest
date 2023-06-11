import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy } from 'passport-google-oauth20';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL:
        'https://62kar4rc7f.execute-api.ap-northeast-2.amazonaws.com/dev/auth/login/google-redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    try {
      const { displayName, emails } = profile;
      const user = {
        email: emails[0].value,
        name: displayName,

        accessToken,
        refreshToken,
      };

      return user;
    } catch (err) {
      console.log(err);
    }
  }
}
