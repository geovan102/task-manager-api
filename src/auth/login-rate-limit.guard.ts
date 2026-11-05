import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import type { Request } from 'express';
import { RedisService } from "../redis/redis.service";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 60;

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const key = `ratelimit:login:${request.ip}`;

    const attempts = await this.redis.increment(key, WINDOW_SECONDS);

    if (attempts > MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many login attempts. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
