import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const userServiceUrl = config.get<string>('USER_SERVICE_URL');
        const res = await fetch(`${userServiceUrl}/auth/jwt-public-key`);
        if (!res.ok) {
          throw new Error(
            `Failed to fetch JWT public key: ${res.status} ${res.statusText}`,
          );
        }
        const { publicKey } = await res.json();
        return {
          publicKey,
          verifyOptions: { algorithms: ['RS256'] },
        };
      },
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
