import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UserPublicDto {
  id: number;
  username: string;
  profilePicUrl: string;
}

@Injectable()
export class UsersApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.getOrThrow<string>('USER_SERVICE_URL');
    this.apiKey = config.getOrThrow<string>('USERS_API_KEY');
  }

  async assertUsersExist(userIds: number[]): Promise<void> {
    const results = await Promise.all(
      userIds.map((id) =>
        fetch(`${this.baseUrl}/api/user/${id}`, {
          headers: { 'X-Api-Key': this.apiKey },
        }).then((res) => ({ id, exists: res.ok }))
      ),
    );

    const missing = results.filter((r) => !r.exists).map((r) => r.id);
    if (missing.length > 0) {
      throw new NotFoundException(`Users not found: ${missing.join(', ')}`);
    }
  }

  async getUsers(userIds: number[]): Promise<UserPublicDto[]> {
    const results = await Promise.all(
      userIds.map((id) =>
        fetch(`${this.baseUrl}/api/user/${id}`, {
          headers: { 'X-Api-Key': this.apiKey },
        }).then((res) => (res.ok ? (res.json() as Promise<UserPublicDto>) : null))
      ),
    );

    return results.filter((u): u is UserPublicDto => u !== null);
  }
}
