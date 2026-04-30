import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MessageType } from '../enums';

export class CreateMessageDto {
  @ApiProperty({ example: 'Hello, world!', description: 'Text or URL content of the message.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ enum: MessageType, example: MessageType.Text, description: 'Message type. Defaults to text.' })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}
