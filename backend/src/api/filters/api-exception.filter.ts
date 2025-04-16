import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // Rate limit responses
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      return response
        .status(status)
        .json({
          statusCode: status,
          message: 'Rate limit exceeded',
          error: 'Too Many Requests',
          throttled: true,
          resetTime: new Date(Date.now() + 60 * 1000).toISOString(),
        });
    }

    // API key errors
    if (status === HttpStatus.UNAUTHORIZED) {
      return response
        .status(status)
        .json({
          statusCode: status,
          message: typeof errorResponse === 'string' 
            ? errorResponse 
            : (errorResponse as any).message || 'Unauthorized',
          error: 'Unauthorized',
          apiKeyValid: false,
        });
    }

    // Permission errors
    if (status === HttpStatus.FORBIDDEN) {
      return response
        .status(status)
        .json({
          statusCode: status,
          message: typeof errorResponse === 'string' 
            ? errorResponse 
            : (errorResponse as any).message || 'Forbidden',
          error: 'Forbidden',
          missingPermission: typeof errorResponse === 'string' 
            ? null 
            : (errorResponse as any).permission || null,
        });
    }

    // Default error response
    response
      .status(status)
      .json(errorResponse);
  }
} 