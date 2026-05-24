import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({ example: 'Gửi mail thành công', nullable: true })
  message: { [key: string]: any };
}

export class RegisterDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsOptional()
  role: string;
}
export class AccountDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ptnminh' })
  @IsString()
  picture: string;
}
