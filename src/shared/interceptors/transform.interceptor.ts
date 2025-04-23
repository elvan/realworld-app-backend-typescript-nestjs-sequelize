import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // If data is already transformed or is a custom response, return it as is
        if (!data || data.errors || data.articles || data.article || 
            data.comments || data.comment || data.profile || data.user || 
            data.tags) {
          return data;
        }
        
        // Otherwise transform it according to the RealWorld API spec format
        const response = {};
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;
        
        // Determine the appropriate response key based on the endpoint
        let key = 'data';
        
        if (url.includes('articles') && !url.includes('comments')) {
          if (Array.isArray(data)) {
            key = 'articles';
          } else {
            key = 'article';
          }
        } else if (url.includes('comments')) {
          if (Array.isArray(data)) {
            key = 'comments';
          } else {
            key = 'comment';
          }
        } else if (url.includes('profiles')) {
          key = 'profile';
        } else if (url.includes('users')) {
          key = 'user';
        } else if (url.includes('tags')) {
          key = 'tags';
        }
        
        response[key] = data;
        return response;
      }),
    );
  }
}
