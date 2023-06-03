import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-naver';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_SECRET,
      callbackURL: 'http://localhost:3002/auth/login/naver',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { _json, displayName } = profile;

    const user = {
      email: _json.email,
      name: displayName,

      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
