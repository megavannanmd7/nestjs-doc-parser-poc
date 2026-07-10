import { Injectable, Logger } from '@nestjs/common';
import { DocumentParser, ParseResult } from '../interfaces/document-parser.interface';

// markitdown-js: new Markitdown().convert(filePath) => { textContent: string, title?: string }
// The convert() is synchronous per library docs
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MarkitdownLib = require('markitdown-js');

interface MarkitdownConvertResult {
  textContent: string;
  title?: string;
}

type MarkitdownConstructor = new () => { convert: (filePath: string) => MarkitdownConvertResult };

const MarkitdownClass: MarkitdownConstructor =
  // Handle both ESM default export and CommonJS module.exports
  (MarkitdownLib?.default ?? MarkitdownLib) as MarkitdownConstructor;

const SUPPORTED_EXTENSIONS = [
  'pdf',
  'docx',
  'xlsx',
  'pptx',
  'csv',
  'html',
  'md',
  'txt',
] as const;

@Injectable()
export class MarkitdownService implements DocumentParser {
  private readonly logger = new Logger(MarkitdownService.name);
  private readonly parserName = 'markitdown';

  getName(): string {
    return this.parserName;
  }

  supports(extension: string): boolean {
    return (SUPPORTED_EXTENSIONS as readonly string[]).includes(
      extension.toLowerCase(),
    );
  }

  getSupportedExtensions(): string[] {
    return [...SUPPORTED_EXTENSIONS];
  }

  async parse(filePath: string): Promise<ParseResult> {
    this.logger.log(`[${this.parserName}] Starting parse: ${filePath}`);
    const startTime = performance.now();

    try {
      const converter = new MarkitdownClass();
      // convert() is synchronous — wrap in promise for uniform interface
      const result = await Promise.resolve(converter.convert(filePath));

      const text = result?.textContent ?? '';
      const durationMs = Math.round(performance.now() - startTime);

      this.logger.log(
        `[${this.parserName}] Parse complete. Duration: ${durationMs}ms | Characters: ${text.length}`,
      );

      return {
        parser: this.parserName,
        success: true,
        durationMs,
        text,
      };
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorMessage = err instanceof Error ? err.message : String(err);

      this.logger.error(
        `[${this.parserName}] Parse failed after ${durationMs}ms: ${errorMessage}`,
      );

      return {
        parser: this.parserName,
        success: false,
        durationMs,
        text: '',
        error: errorMessage,
      };
    }
  }
}
