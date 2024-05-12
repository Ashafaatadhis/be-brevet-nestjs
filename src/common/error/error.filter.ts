import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';

@Catch(
  ZodError,
  HttpException,
  Prisma.PrismaClientValidationError,
  JsonWebTokenError,
  TokenExpiredError,
)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ZodError) {
      response.status(400).json({
        success: false,
        errors: exception.errors,
      });
    } else if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        success: false,
        errors: exception.getResponse(),
      });
    } else if (exception instanceof JsonWebTokenError) {
      response.status(401).json({
        success: false,
        errors: exception.message,
      });
    } else if (exception instanceof TokenExpiredError) {
      response.status(401).json({
        success: false,
        errors: exception.message,
      });
    } else {
      process.env.NODE_ENV === 'production'
        ? response.status(500).json({
            success: false,
            errors: exception.message,
          })
        : response.status(500).json({
            success: false,
            errors: exception.stack,
          });
    }
  }
}
