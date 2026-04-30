import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestContext, EntityManager, MikroORM } from '@mikro-orm/core';
import { UsersApiService } from '../users-api/users-api.service';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chat-member.entity';
import { Message } from './entities/message.entity';
import { ChatMemberRole, MessageType } from './enums';
import {
  AddMemberDto,
  ChatListItemDto,
  ChatMemberDto,
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
    private readonly usersApi: UsersApiService,
  ) {}

  @CreateRequestContext()
  async getChats(userId: number): Promise<ChatListItemDto[]> {
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

        const allMembers = await this.em.find(ChatMember, { chat });
        const users = await this.usersApi.getUsers(allMembers.map((m) => m.userId));
        const members: ChatMemberDto[] = allMembers.map((m) => {
          const user = users.find((u) => u.id === m.userId);
          // TODO: populate imgSrc once profile picture is implemented in the Users API
          return { userId: m.userId, username: user?.username ?? '', imgSrc: '' };
        });

        return {
          id: chat.id,
          name: chat.name,
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
          members,
        } satisfies ChatListItemDto;
      }),
    );
  }

  @CreateRequestContext()
  async getMessages(
    chatId: string,
    userId: number,
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
    userId: number,
    dto: CreateChatDto,
  ): Promise<ChatListItemDto> {
    await this.usersApi.assertUsersExist(dto.memberIds);

    const chat = this.em.create(Chat, {
      name: dto.name,
    });

    const creator = this.em.create(ChatMember, {
      chat,
      userId,
      role: ChatMemberRole.Admin,
    });

    const otherMembers = dto.memberIds
      .filter((memberId) => memberId !== userId)
      .map((memberId) =>
        this.em.create(ChatMember, {
          chat,
          userId: memberId,
          role: ChatMemberRole.Member,
        }),
      );

    this.em.persist([chat, creator, ...otherMembers]);
    await this.em.flush();

    const allMemberIds = [userId, ...otherMembers.map((m) => m.userId)];
    const users = await this.usersApi.getUsers(allMemberIds);
    // TODO: populate imgSrc once profile picture is implemented in the Users API
    const members: ChatMemberDto[] = allMemberIds.map((id) => ({
      userId: id,
      username: users.find((u) => u.id === id)?.username ?? '',
      imgSrc: '',
    }));

    return {
      id: chat.id,
      name: dto.name,
      lastMessage: undefined,
      unreadCount: 0,
      members,
    } satisfies ChatListItemDto;
  }

  @CreateRequestContext()
  async sendMessage(
    chatId: string,
    userId: number,
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
    requestingUserId: number,
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
