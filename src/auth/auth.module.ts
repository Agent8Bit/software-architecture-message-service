import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

const logger = new Logger('AuthModule');

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const userServiceUrl = config.get<string>('USER_SERVICE_URL');
        const apiKey = config.get<string>('USERS_API_KEY');
        logger.log(`Fetching JWT public key from ${userServiceUrl}/api/auth/jwt-key`);
        const res = await fetch(`${userServiceUrl}/api/auth/jwt-key`, {
          headers: { 'X-Api-Key': apiKey! },
        });
        logger.log(`Response status: ${res.status} ${res.statusText}`);
        if (!res.ok) {
          throw new Error(
            `Failed to fetch JWT public key: ${res.status} ${res.statusText}`,
          );
        }
        const body = await res.json();
        logger.log(`Response body keys: ${JSON.stringify(Object.keys(body))}`);
        logger.log(`jwtKey value: ${body.jwtKey ? `[${body.jwtKey}]` : 'UNDEFINED'}`);
        const { jwtKey } = body;
        return {
          publicKey: jwtKey,
          verifyOptions: { algorithms: ['RS256'] },
        };
      },
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
