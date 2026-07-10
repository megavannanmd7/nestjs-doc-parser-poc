import { Injectable, Logger } from '@nestjs/common';
import { DocumentParser, ParseResult } from '../interfaces/document-parser.interface';

// officeparser: parseOfficeAsync(filePath) returns Promise<string> (legacy ≤v6)
//               parseOffice(filePath) returns Promise<AST> with .toText() method (v7+)
// We detect which API is available and use the appropriate one.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const officeparserLib = require('officeparser');

type ParseOfficeAsyncFn = (filePath: string) => Promise<string>;
type ParseOfficeFn = (filePath: string) => Promise<{ toText: () => string } | string>;

const parseOfficeAsync: ParseOfficeAsyncFn | undefined =
  officeparserLib?.parseOfficeAsync as ParseOfficeAsyncFn | undefined;

const parseOffice: ParseOfficeFn | undefined =
  officeparserLib?.parseOffice as ParseOfficeFn | undefined;

const SUPPORTED_EXTENSIONS = [
  'docx',
  'pptx',
  'xlsx',
  'pdf',
  'odt',
  'odp',
  'ods',
] as const;

@Injectable()
export class OfficeparserService implements DocumentParser {
  private readonly logger = new Logger(OfficeparserService.name);
  private readonly parserName = 'officeparser';

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
      const text = await this.extractText(filePath);
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

  private async extractText(filePath: string): Promise<string> {
    // v7+ API: parseOffice returns AST with .toText()
    if (typeof parseOffice === 'function') {
      this.logger.debug(`[${this.parserName}] Using parseOffice API (v7+)`);
      const result = await parseOffice(filePath);

      if (typeof result === 'string') {
        return result;
      }

      if (result && typeof (result as { toText: () => string }).toText === 'function') {
        return (result as { toText: () => string }).toText();
      }

      return String(result ?? '');
    }

    // Legacy API: parseOfficeAsync returns string directly
    if (typeof parseOfficeAsync === 'function') {
      this.logger.debug(`[${this.parserName}] Using parseOfficeAsync API (legacy)`);
      return await parseOfficeAsync(filePath);
    }

    throw new Error(
      'officeparser: No compatible parse function found. Expected parseOffice or parseOfficeAsync.',
    );
  }
}
