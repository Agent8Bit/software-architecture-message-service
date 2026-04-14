import { Migration } from '@mikro-orm/migrations';

export class Migration20260414202318_init extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "chat" ("id" uuid not null default gen_random_uuid(), "name" varchar(255) null, "img_src" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "chat_pkey" primary key ("id"));`);

    this.addSql(`create table "chat_member" ("id" uuid not null default gen_random_uuid(), "chat_id" uuid not null, "user_id" varchar(255) not null, "role" varchar(255) not null default 'member', "joined_at" timestamptz not null, "last_read_at" timestamptz null, "muted" boolean not null default false, constraint "chat_member_pkey" primary key ("id"));`);
    this.addSql(`alter table "chat_member" add constraint "chat_member_chat_id_user_id_unique" unique ("chat_id", "user_id");`);

    this.addSql(`create table "message" ("id" uuid not null default gen_random_uuid(), "chat_id" uuid not null, "sender_id" varchar(255) not null, "type" varchar(255) not null default 'text', "content" text not null, "created_at" timestamptz not null, "edited_at" timestamptz null, "deleted_at" timestamptz null, constraint "message_pkey" primary key ("id"));`);
    this.addSql(`create index "message_sender_id_index" on "message" ("sender_id");`);
    this.addSql(`create index "message_chat_id_created_at_index" on "message" ("chat_id", "created_at");`);

    this.addSql(`alter table "chat_member" add constraint "chat_member_chat_id_foreign" foreign key ("chat_id") references "chat" ("id") on update cascade;`);

    this.addSql(`alter table "message" add constraint "message_chat_id_foreign" foreign key ("chat_id") references "chat" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "chat_member" drop constraint "chat_member_chat_id_foreign";`);

    this.addSql(`alter table "message" drop constraint "message_chat_id_foreign";`);

    this.addSql(`drop table if exists "chat" cascade;`);

    this.addSql(`drop table if exists "chat_member" cascade;`);

    this.addSql(`drop table if exists "message" cascade;`);
  }

}
