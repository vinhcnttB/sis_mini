import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly __configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    try {
      const status = 500;
      const message =
        exception?.response?.message ||
        exception?.message ||
        'Internal server error';

      return response.status(status).json({
        status: false,
        message,
        data: null,
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        status: false,
        message: 'Internal server error',
        data: null,
      });
    }
  }
}
