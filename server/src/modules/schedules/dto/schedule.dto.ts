import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '656565656565656565656565' })
  classId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(7)
  @ApiProperty({ example: 2, description: '1: Chủ Nhật, 2-7: Thứ 2 đến Thứ 7' })
  dayOfWeek: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '08:00' })
  startTime: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '10:00' })
  endTime: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'A101', required: false })
  room?: string;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  @ApiProperty({ example: 2, description: '1: Chủ Nhật, 2-7: Thứ 2 đến Thứ 7' })
  dayOfWeek?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '08:00' })
  startTime?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '10:00' })
  endTime?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'A102' })
  room?: string;
}
