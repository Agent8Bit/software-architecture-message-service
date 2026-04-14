import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import type { Opt } from '@mikro-orm/core';
import { ChatMember } from './chat-member.entity';
import { Message } from './message.entity';

@Entity()
export class Chat {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ nullable: true })
  name?: string;

  @Property({ nullable: true })
  imgSrc?: string;

  @OneToMany(() => ChatMember, (member: ChatMember) => member.chat, { lazy: true })
  members = new Collection<ChatMember>(this);

  @OneToMany(() => Message, (message: Message) => message.chat, { lazy: true })
  messages = new Collection<Message>(this);

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
