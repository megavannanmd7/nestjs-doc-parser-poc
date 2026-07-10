import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Express } from 'express';
import { getExtension, isAllowedExtension } from '../utils/file.util';
import { ALLOWED_EXTENSIONS } from '../constants/file.constants';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please attach a file with field name "file".');
    }

    const ext = getExtension(file.originalname);

    if (!isAllowedExtension(ext)) {
      throw new BadRequestException(
        `File type ".${ext}" is not supported. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    return file;
  }
}
