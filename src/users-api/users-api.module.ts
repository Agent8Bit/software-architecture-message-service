import { Module } from '@nestjs/common';
import { UsersApiService } from './users-api.service';

@Module({
  providers: [UsersApiService],
  exports: [UsersApiService],
})
export class UsersApiModule {}
