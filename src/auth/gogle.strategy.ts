import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL:
        'https://moviemangae-front-git-develop-mandoong.vercel.app/login/google',
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
