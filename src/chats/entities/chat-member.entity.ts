import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import type { Opt } from '@mikro-orm/core';
import { Chat } from './chat.entity';
import { ChatMemberRole } from '../enums';

@Entity()
@Unique({ properties: ['chat', 'userId'] })
export class ChatMember {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Chat)
  chat!: Chat;

  @Property()
  userId!: string;

  @Property({ default: ChatMemberRole.Member })
  role: ChatMemberRole & Opt = ChatMemberRole.Member;

  @Property()
  joinedAt: Date & Opt = new Date();

  @Property({ nullable: true })
  lastReadAt?: Date;

  @Property({ default: false })
  muted: boolean & Opt = false;
}
