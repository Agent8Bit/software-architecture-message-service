import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    this.logger.log(`Incoming cookies: ${JSON.stringify(Object.keys(request.cookies ?? {}))}`);

    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn('No jwt cookie found — rejecting request');
      throw new UnauthorizedException();
    }

    this.logger.log(`jwt cookie found (length: ${token.length})`);

    try {
      const payload = this.jwtService.verify(token);
      this.logger.log(`Token verified — payload: ${JSON.stringify(payload)}`);
      request['user'] = payload;
    } catch (err) {
      this.logger.error(`Token verification failed: ${err instanceof Error ? err.message : err}`);
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    return request.cookies?.jwt;
  }
}
