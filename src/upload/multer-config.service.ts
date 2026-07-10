import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as path from 'path';
import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { getExtension, isAllowedExtension, ensureUploadDirExists } from '../common/utils/file.util';
import { MAX_FILE_SIZE } from '../common/constants/file.constants';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMulterOptions(): MulterModuleOptions {
    const uploadDir =
      this.configService.get<string>('UPLOAD_DIR') ?? './uploads';
    const maxFileSize =
      this.configService.get<number>('MAX_FILE_SIZE') ?? MAX_FILE_SIZE;

    // Ensure upload directory exists at startup
    void ensureUploadDirExists(uploadDir);

    return {
      storage: diskStorage({
        destination: (_req: Request, _file: Express.Multer.File, cb) => {
          cb(null, uploadDir);
        },
        filename: (
          _req: Request,
          file: Express.Multer.File,
          cb,
        ) => {
          const uniqueSuffix = crypto.randomBytes(8).toString('hex');
          const ext = path.extname(file.originalname);
          cb(null, `upload-${Date.now()}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: maxFileSize,
      },
      fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        const ext = getExtension(file.originalname);
        if (!isAllowedExtension(ext)) {
          return cb(
            new BadRequestException(
              `File type ".${ext}" is not allowed. Accepted extensions: pdf, docx, xlsx, pptx, csv, html, md, txt`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    };
  }
}
