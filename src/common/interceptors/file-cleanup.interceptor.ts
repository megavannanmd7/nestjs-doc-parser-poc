import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { Express } from 'express';
import { deleteFile } from '../utils/file.util';

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FileCleanupInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ file?: Express.Multer.File }>();
    const file = request.file;

    return next.handle().pipe(
      tap({
        error: () => {
          // Also cleanup on error
          if (file?.path) {
            void this.cleanup(file.path);
          }
        },
      }),
      finalize(() => {
        if (file?.path) {
          void this.cleanup(file.path);
        }
      }),
    );
  }

  private async cleanup(filePath: string): Promise<void> {
    try {
      await deleteFile(filePath);
      this.logger.debug(`Cleaned up temporary file: ${filePath}`);
    } catch {
      this.logger.warn(`Failed to clean up temporary file: ${filePath}`);
    }
  }
}
