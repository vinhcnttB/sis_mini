import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLES } from 'src/utils';

@Controller('schedules')
@ApiTags('Schedules')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(ROLES.ADMIN)
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    const data = await this.schedulesService.create(createScheduleDto);
    return {
      status: true,
      message: 'Tạo lịch học thành công',
      data,
    };
  }

  @Get('class/:classId')
  async findByClassId(@Param('classId') classId: string) {
    const data = await this.schedulesService.findByClassId(classId);
    return {
      status: true,
      data,
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    const data = await this.schedulesService.update(id, updateScheduleDto);
    return {
      status: true,
      message: 'Cập nhật lịch học thành công',
      data,
    };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.ADMIN)
  async remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
