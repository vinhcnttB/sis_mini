import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty({ required: false, example: 'Minh' })
  firstName: string;

  @IsOptional()
  @ApiProperty({ required: false, example: 'Minh' })
  lastName: string;

  @IsOptional()
  @ApiProperty({ required: false, example: '1' })
  roleId: string;

  @IsOptional()
  @ApiProperty({ required: false, example: '20120331' })
  uniqueId: string;

  @IsOptional()
  @ApiProperty({ required: false, example: true })
  isBan: boolean;
}
