import { MessageType } from '../enums';

export class LastMessageDto {
  id!: string;
  senderId!: string;
  type!: MessageType;
  content!: string;
  createdAt!: Date;
}

export class ChatListItemDto {
  id!: string;
  name?: string;
  imgSrc?: string;
  lastMessage?: LastMessageDto;
  unreadCount!: number;
  memberCount!: number;
}
