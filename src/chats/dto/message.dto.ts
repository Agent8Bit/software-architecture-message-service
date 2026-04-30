import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../enums';

export class MessageDto {
  @ApiProperty({ format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Unique ID of the message.' })
  id!: string;

  @ApiProperty({ example: 42, description: 'ID of the user who sent the message.' })
  senderId!: number;

  @ApiProperty({ enum: MessageType, example: MessageType.Text, description: 'Type of the message.' })
  type!: MessageType;

  @ApiProperty({ example: 'Hello, world!', description: 'Text or URL content of the message.' })
  content!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'When the message was sent.' })
  createdAt!: Date;

  @ApiPropertyOptional({ example: '2024-01-15T11:00:00.000Z', description: 'When the message was last edited. Absent if never edited.' })
  editedAt?: Date;

  @ApiProperty({ example: false, description: 'Whether the message has been soft-deleted. Content will be empty when true.' })
  isDeleted!: boolean;
}

export class PaginatedMessagesDto {
  @ApiProperty({ type: [MessageDto], description: 'Ordered list of messages, newest first.' })
  messages!: MessageDto[];

  @ApiPropertyOptional({
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Pass as `before` in the next request to fetch the next page. Absent when hasMore is false.',
  })
  nextCursor?: string;

  @ApiProperty({ example: true, description: 'Whether more messages exist before the current page.' })
  hasMore!: boolean;
}
