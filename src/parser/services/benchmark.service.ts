import { Injectable, Logger } from '@nestjs/common';
import { ParserFactory } from './parser.factory';
import { BenchmarkMetrics, BenchmarkResult } from '../interfaces/benchmark-result.interface';
import { getTextStatistics } from '../../common/utils/text-statistics.util';
import { getExtension } from '../../common/utils/file.util';
import { MIME_TYPE_MAP } from '../../common/constants/file.constants';

@Injectable()
export class BenchmarkService {
  private readonly logger = new Logger(BenchmarkService.name);

  constructor(private readonly parserFactory: ParserFactory) {}

  /**
   * Runs all supporting parsers against the given file and collects benchmark metrics.
   * Never stops if one parser fails — all parsers always run.
   */
  async benchmarkAll(
    filePath: string,
    filename: string,
    sizeBytes: number,
    mimeType: string,
  ): Promise<BenchmarkResult> {
    const ext = getExtension(filename);
    const supportingParsers = this.parserFactory.getSupportingParsers(filename);
    const allParsers = this.parserFactory.getAllParsers();

    this.logger.log(
      `[Benchmark] Starting for "${filename}" (ext: .${ext}, size: ${sizeBytes} bytes)`,
    );
    this.logger.log(
      `[Benchmark] Supporting parsers: ${supportingParsers.map((p) => p.getName()).join(', ') || 'none'}`,
    );

    const resolvedMimeType =
      mimeType ||
      MIME_TYPE_MAP[ext] ||
      'application/octet-stream';

    const benchmarkResults: BenchmarkMetrics[] = await Promise.all(
      allParsers.map(async (parser): Promise<BenchmarkMetrics> => {
        const parserName = parser.getName();

        // If this parser doesn't support the extension, return a skipped result
        if (!parser.supports(ext)) {
          this.logger.debug(
            `[Benchmark] Skipping ${parserName} — does not support .${ext}`,
          );
          return {
            parser: parserName,
            success: false,
            durationMs: 0,
            charactersExtracted: 0,
            words: 0,
            lines: 0,
            memoryBeforeBytes: 0,
            memoryAfterBytes: 0,
            memoryUsedBytes: 0,
            error: `Parser does not support .${ext} files`,
          };
        }

        this.logger.log(`[Benchmark] Running ${parserName}...`);

        const memoryBefore = process.memoryUsage().heapUsed;

        try {
          const parseResult = await parser.parse(filePath);
          const memoryAfter = process.memoryUsage().heapUsed;
          const memoryUsed = Math.max(0, memoryAfter - memoryBefore);

          const stats = getTextStatistics(parseResult.text);

          this.logger.log(
            `[Benchmark] ${parserName} done — success: ${parseResult.success}, ` +
              `duration: ${parseResult.durationMs}ms, chars: ${stats.characters}, ` +
              `words: ${stats.words}, memory used: ${memoryUsed} bytes`,
          );

          return {
            parser: parserName,
            success: parseResult.success,
            durationMs: parseResult.durationMs,
            charactersExtracted: stats.characters,
            words: stats.words,
            lines: stats.lines,
            memoryBeforeBytes: memoryBefore,
            memoryAfterBytes: memoryAfter,
            memoryUsedBytes: memoryUsed,
            ...(parseResult.error ? { error: parseResult.error } : {}),
          };
        } catch (err: unknown) {
          // This catch block is a safety net — parse() itself should never throw
          const memoryAfter = process.memoryUsage().heapUsed;
          const errorMessage = err instanceof Error ? err.message : String(err);

          this.logger.error(
            `[Benchmark] ${parserName} threw unexpectedly: ${errorMessage}`,
          );

          return {
            parser: parserName,
            success: false,
            durationMs: 0,
            charactersExtracted: 0,
            words: 0,
            lines: 0,
            memoryBeforeBytes: memoryBefore,
            memoryAfterBytes: memoryAfter,
            memoryUsedBytes: Math.max(0, memoryAfter - memoryBefore),
            error: errorMessage,
          };
        }
      }),
    );

    this.logger.log(`[Benchmark] Complete for "${filename}"`);

    return {
      filename,
      size: sizeBytes,
      mimeType: resolvedMimeType,
      benchmark: benchmarkResults,
    };
  }
}
