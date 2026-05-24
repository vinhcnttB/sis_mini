import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'wsjwt') {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: (req) => {
        return req.handshake?.auth?.token;
      },
      secretOrKey: process.env.SECRET_KEY,
    });
  }
  async validate(payload): Promise<any> {
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id: payload._id },
      });
      return { ...user };
    } catch (error) {
      throw new WsException('Unauthorized access');
    }
  }
}
