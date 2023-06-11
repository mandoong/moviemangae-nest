import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_SECRET,
      callbackURL:
        'https://62kar4rc7f.execute-api.ap-northeast-2.amazonaws.com/dev/auth/login/naver',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { _json, displayName } = profile;

    const user = {
      email: _json.email,
      name: displayName,

      accessToken,
      refreshToken,
    };

    return user;
  }
}
