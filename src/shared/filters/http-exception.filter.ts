import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const formattedError = {
      errors: {},
    };

    if (typeof exceptionResponse === 'string') {
      formattedError.errors['message'] = [exceptionResponse];
    } else if (exceptionResponse['message']) {
      if (Array.isArray(exceptionResponse['message'])) {
        // Handle class-validator errors
        exceptionResponse['message'].forEach((error) => {
          const property = error.split(' ')[0];
          if (!formattedError.errors[property]) {
            formattedError.errors[property] = [];
          }
          formattedError.errors[property].push(error);
        });
      } else {
        const key = status === HttpStatus.UNPROCESSABLE_ENTITY ? 'body' : 'message';
        formattedError.errors[key] = [exceptionResponse['message']];
      }
    } else {
      formattedError.errors['message'] = ['An error occurred'];
    }

    response.status(status).json(formattedError);
  }
}
