import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { AuthService } from './auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.APP_FB_ID,
      clientSecret: process.env.APP_FB_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/facebook-redirect`,
      scope: 'email',
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, id } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: `https://graph.facebook.com/${id}/picture?type=large`,
    };
    const provider = 'facebook';
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
    const token = await this.authService.generateAccessToken({
      id: existUser.id,
      email: existUser.email,
    });
    done(null, {
      ...user,
      id: existUser.id,
      accessToken: token,
      ...(existUser?.role?.name || existUser?.role
        ? { role: existUser?.role.name || existUser?.role }
        : {}),
      roleId: existUser?.roleId || 2,
    });
  }
}
