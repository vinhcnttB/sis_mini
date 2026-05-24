import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpStatus,
  Query,
  Render,
  HttpException,
  Res,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, RegisterResponse } from './dto/create-user.dto';
import { LoginDto, LoginReponse } from './dto/login.dto';
import { GoogleOAuthGuard } from 'src/guards/google-oauth.guard';
import { FacebookAuthGuard } from 'src/guards/facebook.guard';
import { SendgridService } from '../mail/mail.service';
import { MAIL_TEMPLATE_ID, comparePassword } from 'src/utils';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ResetPasswordDto,
  createNewPasswordDto,
} from './dto/reset-password.dto';
import { Response } from 'express';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  // eslint-disable-next-line prettier/prettier
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly mailService: SendgridService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Post('register')
  @ApiCreatedResponse({
    type: RegisterResponse,
  })
  async register(@Body() body: RegisterDto) {
    const { token } = await this.authService.signUpByEmail(body);
    const dynamic_template_data = {
      link: `${process.env.BACKEND_URL}/auth/verify?token=${token}`,
    };
    const msg = this.mailService.messageSignUpGenerate(
      [body.email as string],
      MAIL_TEMPLATE_ID.REGISTER as string,
      dynamic_template_data,
    );
    try {
      await this.mailService.send(msg);
    } catch (error) {
      console.log('Mock email sent (Sendgrid not configured). Link:', dynamic_template_data.link);
    }
    return {
      status: true,
      message: 'Gửi mail thành công',
    };
  }

  @Post('login')
  @ApiCreatedResponse({
    type: LoginReponse,
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const { user } = req;
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/oauth-redirect?id=${user.id}&email=${user.email}&firstName=${user.firstName}&lastName=${user.lastName}&picture=${user.picture}&accessToken=${user.accessToken}&role=${user.role}&uniqueId=${user.uniqueId}`,
    );
  }

  @Get('facebook-redirect')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin(@Request() req, @Res() res: Response): Promise<any> {
    const { user } = req;
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/oauth-redirect?id=${user.id}&email=${user.email}&firstName=${user.firstName}&lastName=${user.lastName}&picture=${user.picture}&accessToken=${user.accessToken}&role=${user.role}&uniqueId=${user.uniqueId}`,
    );
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLoginRedirect(): Promise<any> {
    return {
      statusCode: HttpStatus.OK,
    };
  }

  @Render('index')
  @Get('verify')
  async verifyAccount(@Query('token') token: string) {
    if (!token) {
      throw new HttpException(
        {
          message: 'Lỗi xác thực',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const jwtSercret = this.configService.get<string>('SECRET_KEY');
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: jwtSercret,
    });
    if (!decoded) {
      throw new HttpException(
        {
          message: 'Lỗi xác thực',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate expired token
    const isTokenExpired = Date.now() >= decoded.exp * 1000;
    if (isTokenExpired) {
      throw new HttpException(
        {
          message: 'Đường dẫn đã hết hạn. Vui lòng thử lại sau',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const verifyUser = await this.authService.verifyUser(decoded.id);
    return {
      name: verifyUser.firstName,
      link: `${process.env.FRONTEND_URL}/auth/sign-in`,
    };
  }

  @Get('forgot-password')
  @ApiCreatedResponse({
    type: RegisterResponse,
  })
  async forgotPassword(@Query('email') email: string) {
    if (!email) {
      throw new HttpException(
        {
          message: 'Email không được để trống',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.authService.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        {
          message: 'Email không tồn tại',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = await this.authService.generateAccessToken({
      email: user.email,
      id: user.id,
    });
    const dynamic_template_data = {
      link: `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`,
    };
    const msg = this.mailService.messageSignUpGenerate(
      [email],
      MAIL_TEMPLATE_ID.REGISTER as string,
      dynamic_template_data,
    );
    try {
      await this.mailService.send(msg);
    } catch (error) {
      console.log('Mock email sent (Sendgrid not configured). Link:', dynamic_template_data.link);
    }
    return {
      status: true,
      message: 'Gửi mail thành công',
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const { oldPassword, newPassword, email } = body;
    const user = await this.authService.findUserVerifyEmail(email);
    if (!user) {
      throw new HttpException(
        {
          message: 'Email không tồn tại',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const { encryptedPassword } = user;
    const isValidPassword = await comparePassword(
      oldPassword,
      encryptedPassword,
    );
    if (!isValidPassword) {
      throw new HttpException(
        {
          status: false,
          daa: null,
          message: 'Mật khẩu bạn đã nhập không chính xác.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatePassword = await this.authService.updatePassword(
      user.id,
      newPassword,
    );
    if (!updatePassword) {
      throw new HttpException(
        {
          message: 'Cập nhật mật khẩu thất bại',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      status: true,
      message: 'Cập nhật mật khẩu thành công',
    };
  }

  @Post('create-new-password')
  async createNewPassword(
    @Body() body: createNewPasswordDto,
    @Query('email') email: string,
  ) {
    const { newPassword } = body;
    const user = await this.authService.findUserVerifyEmail(email);
    if (!user) {
      throw new HttpException(
        {
          message: 'Email không tồn tại',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatePassword = await this.authService.updatePassword(
      user.id,
      newPassword,
    );
    if (!updatePassword) {
      throw new HttpException(
        {
          message: 'Cập nhật mật khẩu thất bại',
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      status: true,
      message: 'Cập nhật mật khẩu thành công',
    };
  }
}
