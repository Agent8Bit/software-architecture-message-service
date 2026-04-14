import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestContext, EntityManager, MikroORM } from '@mikro-orm/core';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chat-member.entity';
import { Message } from './entities/message.entity';
import { ChatMemberRole, MessageType } from './enums';
import {
  AddMemberDto,
  ChatListItemDto,
  CreateChatDto,
  CreateMessageDto,
  GetMessagesQueryDto,
  LastMessageDto,
  MessageDto,
  PaginatedMessagesDto,
} from './dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}

  @CreateRequestContext()
  async getChats(userId: string): Promise<ChatListItemDto[]> {
    const memberships = await this.em.find(
      ChatMember,
      { userId },
      { populate: ['chat'] },
    );

    return Promise.all(
      memberships.map(async (membership) => {
        const chat = membership.chat;

        const lastMessage = await this.em.findOne(
          Message,
          { chat, deletedAt: null },
          { orderBy: { createdAt: 'DESC' } },
        );

        const unreadCount = await this.em.count(Message, {
          chat,
          deletedAt: null,
          ...(membership.lastReadAt
            ? { createdAt: { $gt: membership.lastReadAt } }
            : {}),
        });

        const memberCount = await this.em.count(ChatMember, { chat });

        return {
          id: chat.id,
          name: chat.name,
          imgSrc: chat.imgSrc,
          lastMessage: lastMessage
            ? ({
                id: lastMessage.id,
                senderId: lastMessage.senderId,
                type: lastMessage.type,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
              } satisfies LastMessageDto)
            : undefined,
          unreadCount,
          memberCount,
        } satisfies ChatListItemDto;
      }),
    );
  }

  @CreateRequestContext()
  async getMessages(
    chatId: string,
    userId: string,
    query: GetMessagesQueryDto,
  ): Promise<PaginatedMessagesDto> {
    const membership = await this.em.findOne(ChatMember, {
      chat: chatId,
      userId,
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = { chat: chatId };

    if (query.before) {
      const cursor = await this.em.findOne(Message, { id: query.before });
      if (!cursor) {
        throw new NotFoundException('Cursor message not found');
      }
      where['createdAt'] = { $lt: cursor.createdAt };
    }

    const messages = await this.em.find(Message, where, {
      orderBy: { createdAt: 'DESC' },
      limit: limit + 1,
    });

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;

    // Update lastReadAt for unread count tracking
    if (page.length > 0 && !query.before) {
      membership.lastReadAt = page[0].createdAt;
      await this.em.flush();
    }

    return {
      messages: page.map((msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        type: msg.type,
        content: msg.deletedAt ? '[This message was deleted]' : msg.content,
        createdAt: msg.createdAt,
        editedAt: msg.editedAt,
        isDeleted: !!msg.deletedAt,
      })),
      nextCursor: hasMore ? page[page.length - 1].id : undefined,
      hasMore,
    } satisfies PaginatedMessagesDto;
  }

  @CreateRequestContext()
  async createChat(
    userId: string,
    dto: CreateChatDto,
  ): Promise<ChatListItemDto> {
    const chat = this.em.create(Chat, {
      name: dto.name,
      imgSrc: dto.imgSrc,
    });

    const creator = this.em.create(ChatMember, {
      chat,
      userId,
      role: ChatMemberRole.Admin,
    });

    const otherMembers = dto.memberIds.map((memberId) =>
      this.em.create(ChatMember, {
        chat,
        userId: memberId,
        role: ChatMemberRole.Member,
      }),
    );

    this.em.persist([chat, creator, ...otherMembers]);
    await this.em.flush();

    return {
      id: chat.id,
      name: dto.name,
      imgSrc: dto.imgSrc,
      lastMessage: undefined,
      unreadCount: 0,
      memberCount: otherMembers.length + 1,
    } satisfies ChatListItemDto;
  }

  @CreateRequestContext()
  async sendMessage(
    chatId: string,
    userId: string,
    dto: CreateMessageDto,
  ): Promise<MessageDto> {
    const membership = await this.em.findOne(ChatMember, {
      chat: chatId,
      userId,
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    const message = this.em.create(Message, {
      chat: this.em.getReference(Chat, chatId),
      senderId: userId,
      type: dto.type ?? MessageType.Text,
      content: dto.content,
    });

    membership.lastReadAt = message.createdAt;

    await this.em.flush();

    return {
      id: message.id,
      senderId: message.senderId,
      type: message.type,
      content: message.content,
      createdAt: message.createdAt,
      isDeleted: false,
    } satisfies MessageDto;
  }

  @CreateRequestContext()
  async addMember(
    chatId: string,
    requestingUserId: string,
    dto: AddMemberDto,
  ): Promise<void> {
    const requester = await this.em.findOne(ChatMember, {
      chat: chatId,
      userId: requestingUserId,
    });

    if (!requester) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    if (requester.role !== ChatMemberRole.Admin) {
      throw new ForbiddenException('Only admins can add members');
    }

    const existing = await this.em.findOne(ChatMember, {
      chat: chatId,
      userId: dto.userId,
    });

    if (existing) {
      throw new ConflictException('User is already a member of this chat');
    }

    const member = this.em.create(ChatMember, {
      chat: this.em.getReference(Chat, chatId),
      userId: dto.userId,
    });

    await this.em.flush();
    void member;
  }
}
