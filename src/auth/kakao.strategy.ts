import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_SECRET,
      callbackURL:
        'https://oqwc40fv0b.execute-api.ap-northeast-2.amazonaws.com/dev/auth/login/kakao',
      scope: ['account_email', 'profile_nickname'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { _json, displayName } = profile;
    const user = {
      email: _json.kakao_account.email,
      name: displayName,

      accessToken,
      refreshToken,
    };

    console.log(user);
    return user;
  }
}
