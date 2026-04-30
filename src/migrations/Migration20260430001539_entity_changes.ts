import { Migration } from '@mikro-orm/migrations';

export class Migration20260430001539_entity_changes extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "chat" drop column "img_src";`);

    this.addSql(`alter table "chat_member" alter column "user_id" type int using ("user_id"::int);`);

    this.addSql(`alter table "message" alter column "sender_id" type int using ("sender_id"::int);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "chat" add column "img_src" varchar(255) null;`);

    this.addSql(`alter table "chat_member" alter column "user_id" type varchar(255) using ("user_id"::varchar(255));`);

    this.addSql(`alter table "message" alter column "sender_id" type varchar(255) using ("sender_id"::varchar(255));`);
  }

}
