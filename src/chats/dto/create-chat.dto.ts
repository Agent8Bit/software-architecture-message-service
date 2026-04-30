import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiPropertyOptional({ example: 'Team Chat', description: 'Display name of the chat. Omit for direct messages.' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ type: [Number], example: [1, 2, 3], description: 'IDs of the users to add as members. The creator is added automatically.' })
  @IsArray()
  @IsInt({ each: true })
  memberIds!: number[];
}
