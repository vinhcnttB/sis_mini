import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '123' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ example: 'email@examle.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class createNewPasswordDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;


}