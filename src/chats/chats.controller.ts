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
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Chats')
@ApiCookieAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @ApiOperation({ summary: 'List all chats for the current user' })
  @ApiOkResponse({ type: [ChatListItemDto] })
  @Get()
  getChats(@CurrentUser() userId: number): Promise<ChatListItemDto[]> {
    return this.chatsService.getChats(userId);
  }

  @ApiOperation({ summary: 'Get paginated messages for a chat' })
  @ApiParam({ name: 'chatId', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiOkResponse({ type: PaginatedMessagesDto })
  @Get(':chatId/messages')
  getMessages(
    @Param('chatId') chatId: string,
    @CurrentUser() userId: number,
    @Query() query: GetMessagesQueryDto,
  ): Promise<PaginatedMessagesDto> {
    return this.chatsService.getMessages(chatId, userId, query);
  }

  @ApiOperation({ summary: 'Send a message to a chat' })
  @ApiParam({ name: 'chatId', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiCreatedResponse({ type: MessageDto })
  @Post(':chatId/messages')
  @HttpCode(HttpStatus.CREATED)
  sendMessage(
    @Param('chatId') chatId: string,
    @CurrentUser() userId: number,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageDto> {
    return this.chatsService.sendMessage(chatId, userId, createMessageDto);
  }

  @ApiOperation({ summary: 'Add a member to a chat' })
  @ApiParam({ name: 'chatId', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiNoContentResponse({ description: 'Member added successfully' })
  @Post(':chatId/members')
  @HttpCode(HttpStatus.CREATED)
  addMember(
    @Param('chatId') chatId: string,
    @CurrentUser() userId: number,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<void> {
    return this.chatsService.addMember(chatId, userId, addMemberDto);
  }

  @ApiOperation({ summary: 'Create a new chat' })
  @ApiCreatedResponse({ type: ChatListItemDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createChat(
    @CurrentUser() userId: number,
    @Body() createChatDto: CreateChatDto,
  ): Promise<ChatListItemDto> {
    return this.chatsService.createChat(userId, createChatDto);
  }
}
