import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '../auth/auth.module';
import { UsersApiModule } from '../users-api/users-api.module';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { Chat, ChatMember, Message } from './entities';
@Module({
  imports: [AuthModule, UsersApiModule, MikroOrmModule.forFeature([Chat, ChatMember, Message])],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
