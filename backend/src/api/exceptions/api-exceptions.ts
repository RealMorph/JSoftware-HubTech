import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiKeyUnauthorizedException extends HttpException {
  constructor(message = 'Invalid API key') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ApiKeyForbiddenException extends HttpException {
  constructor(missingPermission: string) {
    super(`Missing required permission: ${missingPermission}`, HttpStatus.FORBIDDEN);
  }
}

export class RateLimitExceededException extends HttpException {
  constructor(tier: string = 'standard', reset: Date = new Date(Date.now() + 60 * 1000)) {
    super({
      message: 'Rate limit exceeded',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      tier,
      limit: tier === 'premium' ? 20 : 5,
      reset: reset.toISOString(),
    }, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class InvalidRequestException extends HttpException {
  constructor(message = 'Invalid request format') {
    super(message, HttpStatus.BAD_REQUEST);
  }
} 