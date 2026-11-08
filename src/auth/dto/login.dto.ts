import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'name@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  password: string;
}
