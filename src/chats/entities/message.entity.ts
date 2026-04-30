import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import type { Opt } from '@mikro-orm/core';
import { Chat } from './chat.entity';
import { MessageType } from '../enums';

@Entity()
@Index({ properties: ['chat', 'createdAt'] })
export class Message {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Chat)
  chat!: Chat;

  @Property()
  @Index()
  senderId!: number;

  @Property({ default: MessageType.Text })
  type: MessageType & Opt = MessageType.Text;

  @Property({ type: 'text' })
  content!: string;

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ nullable: true })
  editedAt?: Date;

  @Property({ nullable: true })
  deletedAt?: Date;
}
