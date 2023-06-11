import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(@Req() req: Request, @Res() res: Response) {
    try {
      this.authService.OAuthLogin(req, res);
    } catch (e) {
      console.log(e);
    }
  }

  @Get('/login/hello')
  async log() {
    console.log('hello');
  }

  @Get('/login/google-redirect')
  @UseGuards(AuthGuard('google'))
  async loginGoogleRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      this.authService.OAuthLogin(req, res);
    } catch (e) {
      console.log(e);
    }
  }

  @Get('/login/naver')
  @UseGuards(AuthGuard('naver'))
  async loginNaver(@Req() req: Request, @Res() res: Response) {
    this.authService.OAuthLogin(req, res);
  }

  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async loginKakao(@Req() req: Request, @Res() res: Response) {
    this.authService.OAuthLogin(req, res);
  }
}
