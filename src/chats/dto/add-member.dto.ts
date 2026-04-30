import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: 42, description: 'ID of the user to add to the chat.' })
  @IsInt()
  userId!: number;
}
