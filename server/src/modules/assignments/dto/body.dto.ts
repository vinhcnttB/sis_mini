import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAssignmentDTO {
  @ApiProperty({ required: true, example: 1 })
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ required: true, example: 'Minh' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, example: 'https://test' })
  @IsOptional()
  metadata: string;

  @ApiProperty({ required: true, example: '1' })
  gradeId: string;

  @ApiProperty({ required: true, example: 'description' })
  @IsOptional()
  description: string;

  @ApiProperty({ required: true, example: '2021-10-10' })
  @Transform(({ value }) => new Date(value).toISOString())
  @IsOptional()
  dueDate: string;
}

export class StudentAssigmentDto {
  @ApiProperty({ required: false, example: 'https://link' })
  @IsOptional()
  metadata: string;

  @ApiProperty({ required: false, example: 'https://link' })
  @IsOptional()
  description: string;
}

export class UpdateAssignmentDTO {
  @ApiProperty({ required: true, example: 'Minh' })
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ required: true, example: 'Minh' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, example: '1' })
  gradeId: string;

  @ApiProperty({ required: true, example: 'description' })
  @IsOptional()
  description?: string;

  @ApiProperty({ required: true, example: '2021-10-10' })
  @Transform(({ value }) => new Date(value).toISOString())
  dueDate?: string;

  @ApiProperty({ required: true, example: 'COMPLETE' })
  @IsOptional()
  status?: string;

  @ApiProperty({ required: true, example: 'true' })
  @IsOptional()
  isDisable?: boolean;
}

class CreateGrade {
  @ApiProperty({ required: true, example: 'CKI' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, example: 'Minh' })
  @IsNotEmpty()
  percentage: number;
}

export class CreateGradeDto {
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    example: [
      {
        name: 'CKI',
        percentage: 40,
      },
      {
        name: 'CKII',
        percentage: 60,
      },
    ],
  })
  grades: CreateGrade[];
}

export class UpdateGradeDto {
  @ApiProperty({ required: true, example: 'CKI' })
  @IsOptional()
  name: string;

  @ApiProperty({ required: true, example: 'Minh' })
  @IsOptional()
  percentage: number;

  @ApiProperty({
    required: true,
    example: 'STATUS cần nhập ở đây là: COMPLETE nha',
  })
  @IsOptional()
  status: string;
}

class MarkScoreStudent {
  @ApiProperty({ required: true, example: '1711060777' })
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ required: true, example: 10 })
  @IsNotEmpty()
  score: number;
}

export class MarkScoreStudentDto {
  @ApiProperty({
    required: true,
    example: [
      {
        studentId: '1711060777',
        score: 10,
      },
      {
        studentId: '1711060777',
        score: 10,
      },
    ],
    type: [MarkScoreStudent],
  })
  @IsNotEmpty()
  scores: MarkScoreStudent[];
}

export class RequestedGradeViewDto {
  @ApiProperty({ required: false, example: 10 })
  @IsNotEmpty()
  studentAssignmentId: string;

  @ApiProperty({ required: false, example: 10 })
  @IsNotEmpty()
  expectedScore: number;

  @ApiProperty({ required: false, example: 10 })
  @IsNotEmpty()
  comment: string;
}

export class UpdateRequestedGradeViewDto {
  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  actualScore: number;

  @ApiProperty({ required: false, example: 'ACCEPT | DENIED' })
  @IsOptional()
  status: string;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  studentAssignmentId: string;
}

export class CreateConversationDto {
  @ApiProperty({ required: false, example: 'test' })
  @IsNotEmpty()
  message: string;
}
