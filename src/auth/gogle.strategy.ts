import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy } from 'passport-google-oauth20';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID:
        '1018839334367-qtgmojd5mkdi724mq0hinkm02rc1t99c.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL:
        'https://oqwc40fv0b.execute-api.ap-northeast-2.amazonaws.com/dev/auth/login/google',
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
