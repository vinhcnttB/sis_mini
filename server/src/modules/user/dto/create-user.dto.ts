import { ApiProperty } from '@nestjs/swagger';
import { IUser } from 'src/modules/auth/interface/creath-auth.interface';

export class CreateUserDto {}

export class GetUsersResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: [
      {
        email: 'test@mail.com',
        firtName: '123',
        lastName: '123',
      },
    ],
    nullable: true,
  })
  data: {
    user: IUser,
    token: string,
  };
  @ApiProperty({ example: 'Danh sách users', nullable: true })
  message: { [key: string]: any };
}
