import { AuthGuard } from '@nestjs/passport';

export class WsAuthGuard extends AuthGuard('wsjwt') {}
