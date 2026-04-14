import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import {
  AddMemberDto,
  ChatListItemDto,
  CreateChatDto,
  CreateMessageDto,
  GetMessagesQueryDto,
  MessageDto,
  PaginatedMessagesDto,
} from './dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getChats(@Headers('x-user-id') userId: string): Promise<ChatListItemDto[]> {
    return this.chatsService.getChats(userId);
  }

  @Get(':chatId/messages')
  getMessages(
    @Param('chatId') chatId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: GetMessagesQueryDto,
  ): Promise<PaginatedMessagesDto> {
    return this.chatsService.getMessages(chatId, userId, query);
  }

  @Post(':chatId/messages')
  @HttpCode(HttpStatus.CREATED)
  sendMessage(
    @Param('chatId') chatId: string,
    @Headers('x-user-id') userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageDto> {
    return this.chatsService.sendMessage(chatId, userId, createMessageDto);
  }

  @Post(':chatId/members')
  @HttpCode(HttpStatus.CREATED)
  addMember(
    @Param('chatId') chatId: string,
    @Headers('x-user-id') userId: string,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<void> {
    return this.chatsService.addMember(chatId, userId, addMemberDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createChat(
    @Headers('x-user-id') userId: string,
    @Body() createChatDto: CreateChatDto,
  ): Promise<ChatListItemDto> {
    return this.chatsService.createChat(userId, createChatDto);
  }
}
