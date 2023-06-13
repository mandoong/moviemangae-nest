import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GoogleOAuthGuard } from './google-oauth.guard';
import axios from 'axios';
import { google } from 'googleapis';

@Controller('/auth')
export class AuthController {
  oauth2Client: any;
  constructor(private readonly authService: AuthService) {
    this.oauth2Client = new google.auth.OAuth2(
      '1018839334367-qtgmojd5mkdi724mq0hinkm02rc1t99c.apps.googleusercontent.com',
      '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',
      'https://oqwc40fv0b.execute-api.ap-northeast-2.amazonaws.com/dev/auth/login/google-redirect',
    );
  } // private readonly userService: UserService, // private readonly authService: AuthService,

  @Get('login/google')
  // @UseGuards(GoogleOAuthGuard)
  async hi() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile', // get user info
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const url = this.oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',

      // If you only need one scope you can pass it as a string
      scope: scopes,
    });

    return url;
  }

  // @Get('login/google')
  // async loginGoogle() {
  // console.log(req);
  // console.log(res);
  // try {
  //   this.authService.OAuthLogin(req, res);
  // } catch (e) {
  //   console.log(e);
  // }
  // }

  @Get('/login/hello')
  async log() { }

  @Get('/login/google-redirect')
  // @UseGuards(AuthGuard('google'))
  async loginGoogleRedirect(@Req() req: Request) {
    const { tokens } = await this.oauth2Client.getToken(req.query.code);

    this.oauth2Client.setCredentials({ access_token: tokens.access_token });
    const oauth2 = google.oauth2({
      auth: this.oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();

    return {
      query: req.query,
      user: data,
      // user,
    };
    // try {
    //   this.authService.OAuthLogin(req, res);
    // } catch (e) {
    //   console.log(e);
    // }
  }

  // @Get('/login/naver')
  // @UseGuards(AuthGuard('naver'))
  // async loginNaver(@Req() req: Request, @Res() res: Response) {
  //   this.authService.OAuthLogin(req, res);
  // }

  // @Get('/login/kakao')
  // @UseGuards(AuthGuard('kakao'))
  // async loginKakao(@Req() req: Request, @Res() res: Response) {
  //   this.authService.OAuthLogin(req, res);
  // }
}
