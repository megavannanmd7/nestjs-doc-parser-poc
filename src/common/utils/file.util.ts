import { promises as fs } from 'fs';
import * as path from 'path';
import { ALLOWED_EXTENSIONS, AllowedExtension } from '../constants/file.constants';

export function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase().replace('.', '');
}

export function isAllowedExtension(ext: string): ext is AllowedExtension {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be deleted; silently ignore
  }
}

export async function ensureUploadDirExists(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // Directory already exists; silently ignore
  }
}

export function getFileSizeBytes(sizeInBytes: number): number {
  return sizeInBytes;
}
