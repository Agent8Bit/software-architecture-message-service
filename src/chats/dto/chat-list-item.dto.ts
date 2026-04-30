import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../enums';

export class ChatMemberDto {
  @ApiProperty({ example: 42, description: 'ID of the user.' })
  userId!: number;

  @ApiProperty({ example: 'john_doe', description: 'Username of the user.' })
  username!: string;

  // TODO: populate from Users API once profile picture is implemented
  @ApiProperty({ example: '', description: 'Profile picture URL. Currently not provided by the Users API.' })
  imgSrc!: string;
}

export class LastMessageDto {
  @ApiProperty({ format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Unique ID of the message.' })
  id!: string;

  @ApiProperty({ example: 42, description: 'ID of the user who sent the message.' })
  senderId!: number;

  @ApiProperty({ enum: MessageType, example: MessageType.Text, description: 'Type of the message.' })
  type!: MessageType;

  @ApiProperty({ example: 'Hello, world!', description: 'Message content.' })
  content!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'When the message was sent.' })
  createdAt!: Date;
}

export class ChatListItemDto {
  @ApiProperty({ format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Unique ID of the chat.' })
  id!: string;

  @ApiPropertyOptional({ example: 'Team Chat', description: 'Display name of the chat. Absent for direct messages.' })
  name?: string;

  @ApiPropertyOptional({ type: () => LastMessageDto, description: 'Most recent message in the chat. Absent if no messages yet.' })
  lastMessage?: LastMessageDto;

  @ApiProperty({ example: 3, description: 'Number of unread messages for the current user.' })
  unreadCount!: number;

  @ApiProperty({ type: [ChatMemberDto], description: 'Members of the chat.' })
  members!: ChatMemberDto[];
}
