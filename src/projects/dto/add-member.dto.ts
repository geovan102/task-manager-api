import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ example: 'name@example.com' })
  @IsEmail()
  email: string;
}
