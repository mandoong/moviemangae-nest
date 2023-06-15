import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { google } from 'googleapis';

@Controller('/auth')
export class AuthController {
  // oauth2Client: any;
  constructor(private readonly authService: AuthService) {}

  // @Get('login/google')

  // async hi() {
  //   const scopes = [
  //     'https://www.googleapis.com/auth/userinfo.profile', //
  //     'https://www.googleapis.com/auth/userinfo.email',
  //   ];

  //   const url = this.oauth2Client.generateAuthUrl({
  //     access_type: 'offline',
  //     scope: scopes,
  //   });

  //   return url;
  // }

  // @Get('/login/google-redirect')
  // // @UseGuards(AuthGuard('google'))
  // async loginGoogleRedirect(@Req() req: Request) {
  //   const { tokens } = await this.oauth2Client.getToken(req.query.code);

  //   this.oauth2Client.setCredentials({ access_token: tokens.access_token });
  //   const oauth2 = google.oauth2({
  //     auth: this.oauth2Client,
  //     version: 'v2',
  //   });

  //   const { data } = await oauth2.userinfo.get();

  //   return {
  //     query: req.query,
  //     user: data,
  //   };

  // }

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoole(@Req() req) {
    return this.authService.OAuthLogin(req);
  }

  @Get('/login/naver')
  @UseGuards(AuthGuard('naver'))
  async loginNaver(@Req() req) {
    return this.authService.OAuthLogin(req);
  }

  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async loginKakao(@Req() req: Request) {
    return this.authService.OAuthLogin(req);
  }
}
