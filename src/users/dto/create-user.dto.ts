import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'name@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123456789', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
