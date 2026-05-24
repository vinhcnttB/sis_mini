import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean | any> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const accessToken = client.handshake.auth.token;
      if (!accessToken) {
        return new WsException('Unauthorized.');
      }
      const { _id: userId } = this.jwtService.verify(accessToken, {
        secret: process.env.SECRET_KEY,
      });
      if (!userId) {
        return new WsException('Unauthorized.');
      }
      const user = await this.prismaService.users.findUnique(
        {where: {id: userId}}
      );
      if (!user) {
        return new WsException('User is not exists.');
      }
      if(user.roleId) {
        return new WsException('Unauthorized.');
      }
      return true;
    } catch (error) {
      console.log(error);
      throw new WsException(error.message);
    }
  }
}
