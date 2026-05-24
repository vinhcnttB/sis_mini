import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../../guards/ws-auth.guard';
import { PrismaService } from 'src/prisma.service';
@UseGuards(WsAuthGuard)
@WebSocketGateway({
  cors: {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    origin: ['http://localhost:3000'],
  },
  //transports: ['polling', 'websocket'],
})
export class ChatWebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService
  ) {}
  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const accessToken: string = client.handshake.auth.token;
      if (!accessToken) {
        client.disconnect();
      }
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.SECRET_KEY,
      });
      const userId = payload.id || payload._id;
      client.join(userId);
    } catch (error) {
      console.log(error);
    }
  }

  handleDisconnect(socket: Socket): void {
    try {
      socket.disconnect();
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('show-online-user')
  async handleShowOnlineUser() {
    try {
      const usersId = [...this.server.sockets.adapter.rooms.keys()];
      const users = await Promise.all(
        usersId.map(async (id) => {
          return await this.prismaService.users.findUnique({
            where: {
              id
            }
          })
        }),
      );
      const filterUsers = [...users].filter((user) => {
        if (user) {
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            roleId: user.roleId,
          };
        }
      }) as unknown as { id: string; name: string; avatar: string }[];
      this.server.emit('receive-online-user', filterUsers);
    } catch (error) {
      console.log(error);
    }
  }
  
}
