import { MessageType } from '../enums';

export class MessageDto {
  id!: string;
  senderId!: string;
  type!: MessageType;
  content!: string;
  createdAt!: Date;
  editedAt?: Date;
  isDeleted!: boolean;
}

export class PaginatedMessagesDto {
  messages!: MessageDto[];
  nextCursor?: string;
  hasMore!: boolean;
}
