import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceDetailDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'student_id_123' })
  studentId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'PRESENT', description: 'PRESENT, ABSENT, LATE, EXCUSED' })
  status: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Đi muộn 15p', required: false })
  remark?: string;
}

export class SaveAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'class_id_123' })
  classId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '2026-05-22' })
  date: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceDetailDto)
  @ApiProperty({ type: [AttendanceDetailDto] })
  details: AttendanceDetailDto[];
}

export class OpenAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'class_id_123' })
  classId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '2026-05-23', required: false })
  date?: string;
}

export class CheckInAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'class_id_123' })
  classId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '1234' })
  code: string;
}
