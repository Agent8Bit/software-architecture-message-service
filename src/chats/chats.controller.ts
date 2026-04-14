import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
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

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getChats(@CurrentUser() userId: string): Promise<ChatListItemDto[]> {
    return this.chatsService.getChats(userId);
  }

  @Get(':chatId/messages')
  getMessages(
    @Param('chatId') chatId: string,
    @CurrentUser() userId: string,
    @Query() query: GetMessagesQueryDto,
  ): Promise<PaginatedMessagesDto> {
    return this.chatsService.getMessages(chatId, userId, query);
  }

  @Post(':chatId/messages')
  @HttpCode(HttpStatus.CREATED)
  sendMessage(
    @Param('chatId') chatId: string,
    @CurrentUser() userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageDto> {
    return this.chatsService.sendMessage(chatId, userId, createMessageDto);
  }

  @Post(':chatId/members')
  @HttpCode(HttpStatus.CREATED)
  addMember(
    @Param('chatId') chatId: string,
    @CurrentUser() userId: string,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<void> {
    return this.chatsService.addMember(chatId, userId, addMemberDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createChat(
    @CurrentUser() userId: string,
    @Body() createChatDto: CreateChatDto,
  ): Promise<ChatListItemDto> {
    return this.chatsService.createChat(userId, createChatDto);
  }
}
