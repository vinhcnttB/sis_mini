import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLES } from 'src/utils';

@Injectable()
export class UserService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly prismaService: PrismaService,
  ) {}

  async findAll() {
    const users = await this.prismaService.users.findMany({
      include: {
        role: true,
      },
    });

    return {
      status: true,
      data: users?.map((user) => ({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        uniqueId: user.uniqueId,
        role: user.role.name,
        isBan: user.isBan,
      })),
      message: 'Danh sách users',
    };
  }
  async update(email, updateUserDto: any) {
    const user = await this.prismaService.users.update({
      where: {
        email,
      },
      data: updateUserDto,
    });

    return {
      status: true,
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        uniqueId: user.uniqueId,
      },
      message: 'Cập nhật thành công',
    };
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
