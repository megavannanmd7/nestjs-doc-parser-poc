export const ALLOWED_EXTENSIONS = [
  'pdf',
  'docx',
  'xlsx',
  'pptx',
  'csv',
  'html',
  'md',
  'txt',
] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const UPLOAD_DIR = './uploads';

export const MIME_TYPE_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv',
  html: 'text/html',
  md: 'text/markdown',
  txt: 'text/plain',
};

export const PARSER_NAMES = {
  MARKITDOWN: 'markitdown',
  OFFICEPARSER: 'officeparser',
} as const;
