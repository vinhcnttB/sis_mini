import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google-redirect`,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
    };
    const provider = 'google';
    let existUser: any = await this.authService.findUserByEmail(user.email);
    if (!existUser) {
      const password = Math.random().toString(36).slice(-8);
      // create new user
      const response = await this.authService.signUpByEmail({
        ...user,
        provider,
        password,
        emailVerified: true,
        avatar: user.picture,
      });
      existUser = { ...response.user, role: 'user' };
    }
    const access_token = await this.authService.generateAccessToken({
      id: existUser.id,
      email: existUser.email,
    });
    const { isBan } = existUser;
    if (isBan) {
      throw new HttpException(
        {
          status: false,
          daa: null,
          message: 'Tài khoản của bạn đã bị khóa.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    done(null, {
      ...user,
      id: existUser.id,
      accessToken: access_token,
      ...(existUser?.role?.name || existUser?.role
        ? { role: existUser?.role.name || existUser?.role }
        : {}),
      roleId: existUser?.roleId || 2,
    });
  }
}
